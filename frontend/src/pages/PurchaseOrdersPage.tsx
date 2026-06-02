import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Plus, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Loader2, X, Search, Trash2, CheckCircle, XCircle
} from 'lucide-react';
import { purchaseOrdersApi, suppliersApi, warehousesApi, productsApi } from '../api';

const STATUS_BADGES: Record<string, string> = {
  DRAFT: 'badge-draft', APPROVED: 'badge-approved', ORDERED: 'badge-ordered',
  DELIVERED: 'badge-delivered', CANCELLED: 'badge-cancelled',
};
const STATUS_PIPELINE = ['DRAFT', 'APPROVED', 'ORDERED', 'DELIVERED'];
const NEXT_STATUS: Record<string, string> = {
  DRAFT: 'APPROVED', APPROVED: 'ORDERED', ORDERED: 'DELIVERED',
};
const NEXT_LABEL: Record<string, string> = {
  DRAFT: 'Approve', APPROVED: 'Mark Ordered', ORDERED: 'Mark Delivered',
};

const poSchema = z.object({
  supplierId: z.string().min(1, 'Supplier required'),
  warehouseId: z.string().min(1, 'Warehouse required'),
  expectedDeliveryDate: z.string().min(1, 'Expected delivery required'),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.coerce.number().int().positive(),
    unitPrice: z.coerce.number().positive(),
  })).min(1, 'At least one item required'),
});
type POForm = z.infer<typeof poSchema>;

export default function PurchaseOrdersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['purchase-orders', page, statusFilter],
    queryFn: () => purchaseOrdersApi.getAll({ page, limit: 12, status: statusFilter || undefined }),
  });
  const { data: suppliers } = useQuery({ queryKey: ['suppliers-all'], queryFn: () => suppliersApi.getAll({ limit: 100 }) });
  const { data: warehouses } = useQuery({ queryKey: ['warehouses-all'], queryFn: () => warehousesApi.getAll({ limit: 100 }) });
  const { data: productsData } = useQuery({ queryKey: ['products-all'], queryFn: () => productsApi.getAll({ limit: 200 }) });

  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm<POForm>({
    resolver: zodResolver(poSchema),
    defaultValues: { items: [{ productId: '', quantity: 1, unitPrice: 0 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const items = watch('items');
  const total = items?.reduce((s, i) => s + (Number(i.quantity) * Number(i.unitPrice)), 0) || 0;

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => purchaseOrdersApi.updateStatus(id, status),
    onSuccess: (_d, v) => { toast.success(`PO ${v.status === 'DELIVERED' ? 'marked as delivered! Stock updated 📦' : `status updated to ${v.status}`}`); qc.invalidateQueries({ queryKey: ['purchase-orders'] }); qc.invalidateQueries({ queryKey: ['products'] }); },
  });
  const createMut = useMutation({
    mutationFn: (d: POForm) => purchaseOrdersApi.create(d as any),
    onSuccess: () => { toast.success('Purchase Order created'); qc.invalidateQueries({ queryKey: ['purchase-orders'] }); setShowModal(false); reset(); setModalStep(1); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => purchaseOrdersApi.delete(id),
    onSuccess: () => { toast.success('PO deleted'); qc.invalidateQueries({ queryKey: ['purchase-orders'] }); },
  });

  const pos: any[] = data?.data || [];
  const total_ = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const statuses = ['', 'DRAFT', 'APPROVED', 'ORDERED', 'DELIVERED', 'CANCELLED'];
  const products: any[] = productsData?.data || [];

  const autoFillPrice = (idx: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const input = document.querySelector(`input[name="items.${idx}.unitPrice"]`) as HTMLInputElement;
      if (input) input.value = String(product.unitPrice);
    }
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Purchase Orders</h1>
          <p className="page-subtitle">{total_} orders · {pos.filter(p => ['DRAFT', 'APPROVED', 'ORDERED'].includes(p.status)).length} pending</p>
        </div>
        <button onClick={() => { setShowModal(true); setModalStep(1); reset(); }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />Create PO
        </button>
      </div>

      {/* Status Pipeline visual */}
      <div className="bg-card border border-border rounded-2xl p-4 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {STATUS_PIPELINE.map((s, i) => {
            const count = pos.filter(p => p.status === s).length;
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${statusFilter === s ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border hover:bg-muted'}`} onClick={() => setStatusFilter(statusFilter === s ? '' : s)}>
                  <span className="text-lg font-black text-foreground">{count}</span>
                  <span className={`text-xs font-semibold ${STATUS_BADGES[s]} rounded-full px-2 py-0.5`}>{s}</span>
                </div>
                {i < STATUS_PIPELINE.length - 1 && <div className="text-muted-foreground">→</div>}
              </div>
            );
          })}
          <div className={`flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl border cursor-pointer ${statusFilter === 'CANCELLED' ? 'bg-red-500/10 border-red-500/30' : 'border-border hover:bg-muted'}`} onClick={() => setStatusFilter(statusFilter === 'CANCELLED' ? '' : 'CANCELLED')}>
            <span className="text-lg font-black text-foreground">{pos.filter(p => p.status === 'CANCELLED').length}</span>
            <span className="badge-cancelled text-xs rounded-full px-2 py-0.5">CANCELLED</span>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by PO number or supplier…" className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">All Statuses</option>
          {['DRAFT', 'APPROVED', 'ORDERED', 'DELIVERED', 'CANCELLED'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* PO Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>PO Number</th><th>Supplier</th><th>Warehouse</th><th>Status</th><th>Amount</th><th>Expected</th><th>Actions</th><th></th></tr></thead>
            <tbody>
              {isLoading ? [...Array(6)].map((_, i) => <tr key={i}><td colSpan={8}><div className="h-12 skeleton rounded my-1" /></td></tr>) :
                pos.filter(p => !search || p.poNumber.toLowerCase().includes(search.toLowerCase()) || p.supplier?.name?.toLowerCase().includes(search.toLowerCase())).map(po => (
                  <>
                    <tr key={po.id} className="cursor-pointer" onClick={() => setExpanded(expanded === po.id ? null : po.id)}>
                      <td><span className="font-mono font-bold text-sm text-primary">{po.poNumber}</span></td>
                      <td className="font-medium text-sm text-foreground">{po.supplier?.name}</td>
                      <td className="text-sm text-muted-foreground">{po.warehouse?.name}</td>
                      <td><span className={STATUS_BADGES[po.status]}>{po.status}</span></td>
                      <td className="font-bold text-foreground">₹{po.totalAmount?.toLocaleString('en-IN')}</td>
                      <td className="text-sm text-muted-foreground">{po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString('en-IN') : '—'}</td>
                      <td>
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          {NEXT_STATUS[po.status] && (
                            <button onClick={() => statusMut.mutate({ id: po.id, status: NEXT_STATUS[po.status] })} disabled={statusMut.isPending} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50">
                              {statusMut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                              {NEXT_LABEL[po.status]}
                            </button>
                          )}
                          {po.status !== 'DELIVERED' && po.status !== 'CANCELLED' && (
                            <button onClick={() => statusMut.mutate({ id: po.id, status: 'CANCELLED' })} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                              <XCircle className="w-3 h-3" />Cancel
                            </button>
                          )}
                          {po.status === 'DRAFT' && (
                            <button onClick={() => { if (confirm('Delete this PO?')) deleteMut.mutate(po.id); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="text-muted-foreground">
                        {expanded === po.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </td>
                    </tr>
                    <AnimatePresence>
                      {expanded === po.id && (
                        <tr key={`${po.id}-expanded`}>
                          <td colSpan={8} className="p-0">
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                              <div className="px-6 py-4 bg-muted/30 border-t border-border">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Line Items</h4>
                                <table className="w-full text-sm">
                                  <thead><tr className="text-xs text-muted-foreground"><th className="text-left py-1">Product</th><th className="text-right py-1">Qty</th><th className="text-right py-1">Unit Price</th><th className="text-right py-1">Total</th><th className="text-right py-1">Received</th></tr></thead>
                                  <tbody>
                                    {(po.items || []).map((item: any) => (
                                      <tr key={item.id} className="border-t border-border/50">
                                        <td className="py-2 font-medium text-foreground">{item.product?.name || 'Product'}</td>
                                        <td className="text-right">{item.quantity}</td>
                                        <td className="text-right">₹{item.unitPrice?.toLocaleString('en-IN')}</td>
                                        <td className="text-right font-bold">₹{item.totalPrice?.toLocaleString('en-IN')}</td>
                                        <td className="text-right"><span className={`font-bold ${item.receivedQuantity === item.quantity ? 'text-emerald-500' : item.receivedQuantity > 0 ? 'text-amber-500' : 'text-muted-foreground'}`}>{item.receivedQuantity}/{item.quantity}</span></td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {po.notes && <p className="text-xs text-muted-foreground mt-3 italic">Notes: {po.notes}</p>}
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="flex items-center gap-1 px-3 py-2 rounded-xl border border-input text-sm disabled:opacity-40 hover:bg-muted"><ChevronLeft className="w-4 h-4" />Prev</button>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="flex items-center gap-1 px-3 py-2 rounded-xl border border-input text-sm disabled:opacity-40 hover:bg-muted">Next<ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Create PO Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h2 className="text-lg font-bold">Create Purchase Order</h2>
                  <div className="flex items-center gap-2 mt-2">
                    {[1, 2, 3].map(s => (
                      <div key={s} className={`flex items-center gap-1 ${s <= modalStep ? 'text-primary' : 'text-muted-foreground'}`}>
                        <div className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${s < modalStep ? 'bg-primary text-primary-foreground' : s === modalStep ? 'border-2 border-primary text-primary' : 'border border-border'}`}>{s < modalStep ? '✓' : s}</div>
                        <span className="text-xs font-medium hidden sm:inline">{['Info', 'Items', 'Review'][s - 1]}</span>
                        {s < 3 && <span className="text-muted-foreground">→</span>}
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={() => { setShowModal(false); reset(); setModalStep(1); }} className="p-2 rounded-xl hover:bg-muted"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit((d) => createMut.mutate(d))} className="overflow-y-auto p-6">
                {modalStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Supplier *</label>
                      <select {...register('supplierId')} className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="">Select supplier…</option>
                        {(suppliers?.data || []).map((s: any) => <option key={s.id} value={s.id}>{s.name} (Lead: {s.leadTimeDays}d)</option>)}
                      </select>
                      {errors.supplierId && <p className="text-xs text-destructive mt-1">{errors.supplierId.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Delivery Warehouse *</label>
                      <select {...register('warehouseId')} className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="">Select warehouse…</option>
                        {(warehouses?.data || []).map((w: any) => <option key={w.id} value={w.id}>{w.name} — {w.city}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Expected Delivery Date *</label>
                      <input {...register('expectedDeliveryDate')} type="date" className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Notes</label>
                      <textarea {...register('notes')} rows={3} className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <button type="button" onClick={() => setModalStep(2)} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">Next: Add Items →</button>
                  </div>
                )}
                {modalStep === 2 && (
                  <div className="space-y-4">
                    {fields.map((field, idx) => (
                      <div key={field.id} className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-muted-foreground">Item {idx + 1}</span>
                          {fields.length > 1 && <button type="button" onClick={() => remove(idx)} className="text-destructive hover:text-destructive/80"><Trash2 className="w-4 h-4" /></button>}
                        </div>
                        <select {...register(`items.${idx}.productId`)} onChange={e => autoFillPrice(idx, e.target.value)} className="w-full px-3 py-2 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                          <option value="">Select product…</option>
                          {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                        </select>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-muted-foreground">Quantity</label>
                            <input {...register(`items.${idx}.quantity`)} type="number" min="1" className="w-full px-3 py-2 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring mt-1" />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Unit Price (₹)</label>
                            <input {...register(`items.${idx}.unitPrice`)} type="number" step="0.01" className="w-full px-3 py-2 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring mt-1" />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => append({ productId: '', quantity: 1, unitPrice: 0 })} className="w-full py-2.5 rounded-xl border-2 border-dashed border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors">
                      + Add Another Item
                    </button>
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-right">
                      <span className="text-sm text-muted-foreground">Total: </span>
                      <span className="text-xl font-black text-primary">₹{total.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setModalStep(1)} className="flex-1 py-2.5 rounded-xl border border-input text-sm font-semibold hover:bg-muted">← Back</button>
                      <button type="button" onClick={() => setModalStep(3)} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">Review →</button>
                    </div>
                  </div>
                )}
                {modalStep === 3 && (
                  <div className="space-y-4">
                    <div className="bg-muted/30 rounded-xl p-4 space-y-2 text-sm">
                      <p className="font-semibold text-foreground mb-3">Order Summary</p>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Items:</span><span className="font-bold">{fields.length}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Total Amount:</span><span className="font-black text-primary text-lg">₹{total.toLocaleString('en-IN')}</span></div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setModalStep(2)} className="flex-1 py-2.5 rounded-xl border border-input text-sm font-semibold hover:bg-muted">← Back</button>
                      <button type="submit" disabled={createMut.isPending} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-60">
                        {createMut.isPending && <Loader2 className="w-4 h-4 animate-spin" />}Submit PO
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}