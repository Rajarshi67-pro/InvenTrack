import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Plus, Search, Barcode, Edit2, Trash2, X, Loader2,
  Package, LayoutGrid, List, ChevronLeft, ChevronRight
} from 'lucide-react';
import { productsApi, warehousesApi, suppliersApi } from '../api';
import { useAuthStore } from '../store/authStore';

const STATUS_CLASSES: Record<string, string> = {
  NORMAL: 'badge-normal', LOW_STOCK: 'badge-low', OUT_OF_STOCK: 'badge-out', OVERSTOCK: 'badge-over',
};
const STATUS_LABELS: Record<string, string> = {
  NORMAL: 'Normal', LOW_STOCK: 'Low Stock', OUT_OF_STOCK: 'Out of Stock', OVERSTOCK: 'Overstock',
};
const CATEGORIES = ['Electronics', 'Clothing', 'Food & Beverage', 'Machinery', 'Furniture', 'Office Supplies', 'Raw Materials', 'Finished Goods'];
const UNITS = ['UNIT', 'KG', 'PCS', 'BOX', 'REAM', 'TIN', 'LITRE', 'METER'];

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  sku: z.string().min(2, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  unitPrice: z.coerce.number().positive('Price must be positive'),
  quantity: z.coerce.number().min(0),
  minStockLevel: z.coerce.number().min(0),
  maxStockLevel: z.coerce.number().min(0),
  reorderPoint: z.coerce.number().min(0),
  unitOfMeasure: z.string().min(1),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  supplierId: z.string().optional(),
});
type ProductForm = z.infer<typeof schema>;

export default function ProductsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const qc = useQueryClient();
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [barcodeProduct, setBarcodeProduct] = useState<any>(null);
  const LIMIT = 15;

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, search, category, stockStatus, warehouseId],
    queryFn: () => productsApi.getAll({ page, limit: LIMIT, search: search || undefined, category: category || undefined, stockStatus: stockStatus || undefined, warehouseId: warehouseId || undefined }),
  });
  const { data: warehouses } = useQuery({ queryKey: ['warehouses-all'], queryFn: () => warehousesApi.getAll({ limit: 100 }) });
  const { data: suppliers } = useQuery({ queryKey: ['suppliers-all'], queryFn: () => suppliersApi.getAll({ limit: 100 }) });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProductForm>({ resolver: zodResolver(schema) });

  const createMutation = useMutation({
    mutationFn: (d: ProductForm) => productsApi.create(d),
    onSuccess: () => { toast.success('Product created'); qc.invalidateQueries({ queryKey: ['products'] }); setShowModal(false); reset(); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, d }: { id: string; d: Partial<ProductForm> }) => productsApi.update(id, d),
    onSuccess: () => { toast.success('Product updated'); qc.invalidateQueries({ queryKey: ['products'] }); setShowModal(false); setEditProduct(null); reset(); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => { toast.success('Product deleted'); qc.invalidateQueries({ queryKey: ['products'] }); },
  });

  const openEdit = (p: any) => {
    setEditProduct(p);
    Object.entries(p).forEach(([k, v]) => setValue(k as any, v as any));
    setShowModal(true);
  };
  const onSubmit = (d: ProductForm) => {
    if (editProduct) updateMutation.mutate({ id: editProduct.id, d });
    else createMutation.mutate(d);
  };

  const products: any[] = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  // Barcode generation
  useEffect(() => {
    if (!barcodeProduct) return;
    const timer = setTimeout(() => {
      const canvas = document.getElementById('barcode-canvas') as HTMLCanvasElement;
      if (!canvas) return;
      try {
        (window as any).JsBarcode(canvas, barcodeProduct.sku, { format: 'CODE128', width: 2, height: 80, displayValue: true, fontSize: 13, margin: 10 });
      } catch {}
    }, 100);
    return () => clearTimeout(timer);
  }, [barcodeProduct]);

  const downloadBarcode = () => {
    const canvas = document.getElementById('barcode-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `barcode-${barcodeProduct.sku}.png`;
    a.click();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Catalog</h1>
          <p className="page-subtitle">{total.toLocaleString()} products · {data?.data?.filter((p: any) => p.stockStatus !== 'NORMAL')?.length || 0} need attention</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditProduct(null); reset(); setShowModal(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search products, SKU, barcode…" className="w-full pl-9 pr-3 py-2 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} className="px-3 py-2 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={stockStatus} onChange={e => { setStockStatus(e.target.value); setPage(1); }} className="px-3 py-2 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">All Statuses</option>
            {Object.keys(STATUS_LABELS).map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <select value={warehouseId} onChange={e => { setWarehouseId(e.target.value); setPage(1); }} className="px-3 py-2 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">All Warehouses</option>
            {(warehouses?.data || []).map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <div className="flex rounded-xl border border-input overflow-hidden">
            <button onClick={() => setView('table')} className={`px-3 py-2 ${view === 'table' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'} transition-colors`}><List className="w-4 h-4" /></button>
            <button onClick={() => setView('grid')} className={`px-3 py-2 ${view === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'} transition-colors`}><LayoutGrid className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Table View */}
      {view === 'table' && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Warehouse</th>{isAdmin && <th>Actions</th>}</tr></thead>
              <tbody>
                {isLoading ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i}><td colSpan={isAdmin ? 8 : 7}><div className="h-10 skeleton rounded-lg my-1" /></td></tr>
                  ))
                ) : products.length === 0 ? (
                  <tr><td colSpan={isAdmin ? 8 : 7} className="text-center py-16">
                    <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="font-semibold text-muted-foreground">No products found</p>
                  </td></tr>
                ) : products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="font-semibold text-foreground text-sm max-w-[180px] truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.description?.slice(0, 40)}…</div>
                    </td>
                    <td><span className="font-mono text-xs bg-muted px-2 py-0.5 rounded-lg">{p.sku}</span></td>
                    <td className="text-sm text-foreground">{p.category}</td>
                    <td className="font-bold text-foreground">₹{p.unitPrice?.toLocaleString('en-IN')}</td>
                    <td className="font-bold text-sm">{p.quantity?.toLocaleString()}</td>
                    <td><span className={STATUS_CLASSES[p.stockStatus] || 'badge-status'}>{STATUS_LABELS[p.stockStatus] || p.stockStatus}</span></td>
                    <td className="text-sm text-muted-foreground max-w-[100px] truncate">{p.warehouse?.name}</td>
                    {isAdmin && (
                      <td>
                        <div className="flex items-center gap-1">
                          <button onClick={() => setBarcodeProduct(p)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Barcode className="w-4 h-4" /></button>
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => { if (confirm(`Delete "${p.name}"?`)) deleteMutation.mutate(p.id); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid View */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {isLoading ? [...Array(8)].map((_, i) => <div key={i} className="skeleton h-56 rounded-2xl" />) :
            products.map(p => (
              <motion.div key={p.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-card-hover transition-all" whileHover={{ y: -3 }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Package className="w-5 h-5 text-primary" /></div>
                  <span className={STATUS_CLASSES[p.stockStatus]}>{STATUS_LABELS[p.stockStatus]}</span>
                </div>
                <h3 className="font-bold text-foreground text-sm leading-tight mb-1 line-clamp-2">{p.name}</h3>
                <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{p.sku}</span>
                <div className="text-xs text-muted-foreground mt-2">{p.category}</div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xl font-black text-foreground">₹{p.unitPrice?.toLocaleString('en-IN')}</span>
                  <span className={`text-sm font-bold ${p.quantity === 0 ? 'text-red-500' : p.quantity <= p.minStockLevel ? 'text-amber-500' : 'text-emerald-500'}`}>{p.quantity} units</span>
                </div>
                {isAdmin && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <button onClick={() => setBarcodeProduct(p)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1"><Barcode className="w-3 h-3" />Barcode</button>
                    <button onClick={() => openEdit(p)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-1"><Edit2 className="w-3 h-3" />Edit</button>
                    <button onClick={() => { if (confirm(`Delete "${p.name}"?`)) deleteMutation.mutate(p.id); }} className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center gap-1"><Trash2 className="w-3 h-3" />Delete</button>
                  </div>
                )}
              </motion.div>
            ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Page {page} of {totalPages} · {total} total products</p>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="flex items-center gap-1 px-3 py-2 rounded-xl border border-input text-sm font-medium disabled:opacity-40 hover:bg-muted transition-colors"><ChevronLeft className="w-4 h-4" />Prev</button>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="flex items-center gap-1 px-3 py-2 rounded-xl border border-input text-sm font-medium disabled:opacity-40 hover:bg-muted transition-colors">Next<ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-lg font-bold text-foreground">{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => { setShowModal(false); setEditProduct(null); reset(); }} className="p-2 rounded-xl hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'name', label: 'Product Name', placeholder: 'Dell Latitude Laptop', colSpan: true },
                    { id: 'sku', label: 'SKU', placeholder: 'ELEC-LPT-001' },
                    { id: 'description', label: 'Description', placeholder: 'Short description…', colSpan: true },
                  ].map(f => (
                    <div key={f.id} className={f.colSpan ? 'col-span-2' : ''}>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{f.label}</label>
                      <input {...register(f.id as any)} placeholder={f.placeholder} className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      {errors[f.id as keyof typeof errors] && <p className="text-xs text-destructive mt-1">{(errors as any)[f.id]?.message}</p>}
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Category</label>
                    <select {...register('category')} className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">Select…</option>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Unit of Measure</label>
                    <select {...register('unitOfMeasure')} className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      {UNITS.map(u => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                  {[
                    { id: 'unitPrice', label: 'Unit Price (₹)' },
                    { id: 'quantity', label: 'Initial Quantity' },
                    { id: 'minStockLevel', label: 'Min Stock Level' },
                    { id: 'maxStockLevel', label: 'Max Stock Level' },
                    { id: 'reorderPoint', label: 'Reorder Point' },
                  ].map(f => (
                    <div key={f.id}>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{f.label}</label>
                      <input {...register(f.id as any)} type="number" className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Warehouse *</label>
                    <select {...register('warehouseId')} className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">Select warehouse…</option>
                      {(warehouses?.data || []).map((w: any) => <option key={w.id} value={w.id}>{w.name} — {w.city}</option>)}
                    </select>
                    {errors.warehouseId && <p className="text-xs text-destructive mt-1">{errors.warehouseId.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Supplier</label>
                    <select {...register('supplierId')} className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">No supplier</option>
                      {(suppliers?.data || []).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); setEditProduct(null); reset(); }} className="flex-1 py-2.5 rounded-xl border border-input text-sm font-semibold hover:bg-muted transition-colors">Cancel</button>
                  <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Barcode Modal */}
      <AnimatePresence>
        {barcodeProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">Product Barcode</h2>
                <button onClick={() => setBarcodeProduct(null)} className="p-2 rounded-xl hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="text-center">
                <p className="font-bold text-foreground mb-1">{barcodeProduct.name}</p>
                <p className="text-sm text-muted-foreground mb-4">SKU: {barcodeProduct.sku}</p>
                <div className="bg-white p-4 rounded-xl flex items-center justify-center">
                  <canvas id="barcode-canvas" />
                </div>
                <button onClick={downloadBarcode} className="mt-4 w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">Download PNG</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}