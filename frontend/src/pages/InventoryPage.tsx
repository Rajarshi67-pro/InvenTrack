import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, SlidersHorizontal, Search, X, Loader2, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { inventoryApi, productsApi, warehousesApi } from '../api';

const TABS = ['History', 'Stock In', 'Stock Out', 'Transfer', 'Adjustment'] as const;
type Tab = typeof TABS[number];

const MOVE_BADGES: Record<string, string> = {
  IN: 'badge-normal', OUT: 'badge-out', TRANSFER: 'badge-approved', ADJUSTMENT: 'badge-low',
};

const stockInSchema = z.object({
  productId: z.string().min(1, 'Product required'),
  warehouseId: z.string().min(1, 'Warehouse required'),
  quantity: z.coerce.number().int().positive('Quantity must be positive'),
  batchNumber: z.string().optional(),
  remarks: z.string().optional(),
});
const stockOutSchema = z.object({
  productId: z.string().min(1, 'Product required'),
  warehouseId: z.string().min(1, 'Warehouse required'),
  quantity: z.coerce.number().int().positive(),
  purpose: z.string().optional(),
  remarks: z.string().optional(),
});
const transferSchema = z.object({
  productId: z.string().min(1),
  fromWarehouseId: z.string().min(1),
  toWarehouseId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  remarks: z.string().optional(),
});
const adjustSchema = z.object({
  productId: z.string().min(1),
  warehouseId: z.string().min(1),
  newQuantity: z.coerce.number().int().min(0),
  reason: z.string().min(3, 'Reason required'),
});

function ProductSelect({ register, name, products }: any) {
  return (
    <select {...register(name)} className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
      <option value="">Select product…</option>
      {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.sku}) — {p.quantity} in stock</option>)}
    </select>
  );
}

function WarehouseSelect({ register, name, warehouses, label = 'Warehouse' }: any) {
  return (
    <div>
      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
      <select {...register(name)} className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
        <option value="">Select warehouse…</option>
        {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name} — {w.city}</option>)}
      </select>
    </div>
  );
}

function FormCard({ children, onSubmit, title, icon: Icon, iconColor }: any) {
  return (
    <form onSubmit={onSubmit} className="bg-card border border-border rounded-2xl p-6 max-w-xl space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-xl ${iconColor} flex items-center justify-center`}><Icon className="w-5 h-5" /></div>
        <h3 className="font-bold text-foreground text-lg">{title}</h3>
      </div>
      {children}
    </form>
  );
}

export default function InventoryPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('History');
  const [search, setSearch] = useState('');
  const [moveType, setMoveType] = useState('');
  const [page, setPage] = useState(1);

  const { data: movements, isLoading: movLoading } = useQuery({
    queryKey: ['movements', page, moveType],
    queryFn: () => inventoryApi.getMovements({ page, limit: 15, type: moveType || undefined }),
    enabled: tab === 'History',
  });
  const { data: productsData } = useQuery({ queryKey: ['products-all'], queryFn: () => productsApi.getAll({ limit: 200 }) });
  const { data: warehousesData } = useQuery({ queryKey: ['warehouses-all'], queryFn: () => warehousesApi.getAll({ limit: 100 }) });

  const products: any[] = productsData?.data || [];
  const warehouses: any[] = warehousesData?.data || [];

  const inForm = useForm({ resolver: zodResolver(stockInSchema) });
  const outForm = useForm({ resolver: zodResolver(stockOutSchema) });
  const transferForm = useForm({ resolver: zodResolver(transferSchema) });
  const adjustForm = useForm({ resolver: zodResolver(adjustSchema) });

  const newQty = adjustForm.watch('newQuantity');
  const adjProduct = products.find((p: any) => p.id === adjustForm.watch('productId'));

  const stockInMut = useMutation({ mutationFn: (d: any) => inventoryApi.stockIn(d), onSuccess: () => { toast.success('Stock In recorded'); qc.invalidateQueries({ queryKey: ['movements'] }); qc.invalidateQueries({ queryKey: ['products'] }); inForm.reset(); } });
  const stockOutMut = useMutation({ mutationFn: (d: any) => inventoryApi.stockOut(d), onSuccess: () => { toast.success('Stock Out recorded'); qc.invalidateQueries({ queryKey: ['movements'] }); qc.invalidateQueries({ queryKey: ['products'] }); outForm.reset(); } });
  const transferMut = useMutation({ mutationFn: (d: any) => inventoryApi.transfer(d), onSuccess: () => { toast.success('Transfer completed'); qc.invalidateQueries({ queryKey: ['movements'] }); qc.invalidateQueries({ queryKey: ['products'] }); transferForm.reset(); } });
  const adjustMut = useMutation({ mutationFn: (d: any) => inventoryApi.adjustment(d), onSuccess: () => { toast.success('Adjustment recorded'); qc.invalidateQueries({ queryKey: ['movements'] }); qc.invalidateQueries({ queryKey: ['products'] }); adjustForm.reset(); } });

  const tabVariants = { initial: { opacity: 0, x: 10 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -10 } };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-subtitle">Track all stock movements and adjustments</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 rounded-2xl p-1 overflow-x-auto">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}`}>
            {t === 'History' && <Activity className="w-4 h-4" />}
            {t === 'Stock In' && <ArrowDownCircle className="w-4 h-4" />}
            {t === 'Stock Out' && <ArrowUpCircle className="w-4 h-4" />}
            {t === 'Transfer' && <ArrowLeftRight className="w-4 h-4" />}
            {t === 'Adjustment' && <SlidersHorizontal className="w-4 h-4" />}
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} variants={tabVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>

          {/* History Tab */}
          {tab === 'History' && (
            <div className="space-y-4">
              <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search movements…" className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <select value={moveType} onChange={e => { setMoveType(e.target.value); setPage(1); }} className="px-3 py-2 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">All Types</option>
                  {['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead><tr><th>Date/Time</th><th>Product</th><th>Type</th><th>Qty</th><th>Warehouse</th><th>By</th><th>Remarks</th></tr></thead>
                    <tbody>
                      {movLoading ? [...Array(8)].map((_, i) => <tr key={i}><td colSpan={7}><div className="h-10 skeleton rounded my-1" /></td></tr>) :
                        (movements?.data || []).map((m: any) => (
                          <tr key={m.id}>
                            <td className="text-xs text-muted-foreground whitespace-nowrap">{new Date(m.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                            <td>
                              <div className="font-medium text-sm text-foreground">{m.product?.name}</div>
                              <span className="font-mono text-xs text-muted-foreground">{m.product?.sku}</span>
                            </td>
                            <td><span className={MOVE_BADGES[m.movementType] || 'badge-status'}>{m.movementType}</span></td>
                            <td className={`font-bold text-sm ${m.movementType === 'IN' ? 'text-emerald-500' : m.movementType === 'OUT' ? 'text-red-500' : 'text-blue-500'}`}>
                              {m.movementType === 'IN' ? '+' : m.movementType === 'OUT' ? '-' : '±'}{m.quantity}
                            </td>
                            <td className="text-sm text-muted-foreground">{m.warehouse?.name}</td>
                            <td className="text-sm text-foreground">{m.performer?.fullName}</td>
                            <td className="text-xs text-muted-foreground max-w-[160px] truncate">{m.remarks}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Page {page} of {movements?.totalPages || 1}</p>
                <div className="flex gap-2">
                  <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="flex items-center gap-1 px-3 py-2 rounded-xl border border-input text-sm disabled:opacity-40 hover:bg-muted"><ChevronLeft className="w-4 h-4" />Prev</button>
                  <button disabled={!movements?.hasNext} onClick={() => setPage(p => p + 1)} className="flex items-center gap-1 px-3 py-2 rounded-xl border border-input text-sm disabled:opacity-40 hover:bg-muted">Next<ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          )}

          {tab === 'Stock In' && (
            <FormCard onSubmit={inForm.handleSubmit((d: any) => stockInMut.mutate(d))} title="Record Stock In" icon={ArrowDownCircle} iconColor="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Product *</label>
                <ProductSelect register={inForm.register} name="productId" products={products} />
              </div>
              <WarehouseSelect register={inForm.register} name="warehouseId" warehouses={warehouses} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Quantity *</label>
                  <input {...inForm.register('quantity')} type="number" min="1" className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Batch Number</label>
                  <input {...inForm.register('batchNumber')} className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Remarks</label>
                <textarea {...inForm.register('remarks')} rows={3} className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <button type="submit" disabled={stockInMut.isPending} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {stockInMut.isPending && <Loader2 className="w-4 h-4 animate-spin" />}Record Stock In
              </button>
            </FormCard>
          )}

          {tab === 'Stock Out' && (
            <FormCard onSubmit={outForm.handleSubmit((d: any) => stockOutMut.mutate(d))} title="Record Stock Out" icon={ArrowUpCircle} iconColor="bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Product *</label>
                <ProductSelect register={outForm.register} name="productId" products={products} />
              </div>
              <WarehouseSelect register={outForm.register} name="warehouseId" warehouses={warehouses} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Quantity *</label>
                  <input {...outForm.register('quantity')} type="number" min="1" className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Purpose</label>
                  <input {...outForm.register('purpose')} placeholder="e.g. Sales order" className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Remarks</label>
                <textarea {...outForm.register('remarks')} rows={3} className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <button type="submit" disabled={stockOutMut.isPending} className="w-full py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {stockOutMut.isPending && <Loader2 className="w-4 h-4 animate-spin" />}Record Stock Out
              </button>
            </FormCard>
          )}

          {tab === 'Transfer' && (
            <FormCard onSubmit={transferForm.handleSubmit((d: any) => transferMut.mutate(d))} title="Transfer Stock" icon={ArrowLeftRight} iconColor="bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Product *</label>
                <ProductSelect register={transferForm.register} name="productId" products={products} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <WarehouseSelect register={transferForm.register} name="fromWarehouseId" warehouses={warehouses} label="From Warehouse" />
                <WarehouseSelect register={transferForm.register} name="toWarehouseId" warehouses={warehouses} label="To Warehouse" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Quantity *</label>
                <input {...transferForm.register('quantity')} type="number" min="1" className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Remarks</label>
                <textarea {...transferForm.register('remarks')} rows={2} className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <button type="submit" disabled={transferMut.isPending} className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {transferMut.isPending && <Loader2 className="w-4 h-4 animate-spin" />}Execute Transfer
              </button>
            </FormCard>
          )}

          {tab === 'Adjustment' && (
            <FormCard onSubmit={adjustForm.handleSubmit((d: any) => adjustMut.mutate(d))} title="Stock Adjustment" icon={SlidersHorizontal} iconColor="bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Product *</label>
                <ProductSelect register={adjustForm.register} name="productId" products={products} />
              </div>
              <WarehouseSelect register={adjustForm.register} name="warehouseId" warehouses={warehouses} />
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">New Quantity *</label>
                <input {...adjustForm.register('newQuantity')} type="number" min="0" className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                {adjProduct && newQty !== undefined && (
                  <p className={`text-xs mt-1 font-semibold ${Number(newQty) >= adjProduct.quantity ? 'text-emerald-500' : 'text-red-500'}`}>
                    Delta: {Number(newQty) >= adjProduct.quantity ? '+' : ''}{Number(newQty) - adjProduct.quantity} units (current: {adjProduct.quantity})
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Reason *</label>
                <textarea {...adjustForm.register('reason')} rows={3} placeholder="e.g. Physical count discrepancy, damage, etc." className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <button type="submit" disabled={adjustMut.isPending} className="w-full py-3 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {adjustMut.isPending && <Loader2 className="w-4 h-4 animate-spin" />}Apply Adjustment
              </button>
            </FormCard>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}