import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Search, X, AlertTriangle, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../api/client';

const MOCK = [
  { id: 'p1', name: 'Industrial Valve XL-500', sku: 'IND-VLV-500', category: 'Industrial Parts', quantity: 342, minStockLevel: 50, unitPrice: 129.99, isActive: 1 },
  { id: 'p2', name: 'Hydraulic Pump HP-300', sku: 'HYD-PMP-300', category: 'Machinery', quantity: 18, minStockLevel: 20, unitPrice: 899.50, isActive: 1 },
  { id: 'p3', name: 'Conveyor Belt CB-12', sku: 'CVY-BLT-012', category: 'Conveyor Systems', quantity: 0, minStockLevel: 5, unitPrice: 2450.00, isActive: 1 },
  { id: 'p4', name: 'Safety Helmet Pro', sku: 'SAF-HLM-PRO', category: 'Safety Equipment', quantity: 210, minStockLevel: 100, unitPrice: 34.99, isActive: 1 },
  { id: 'p5', name: 'Electric Motor EM-750W', sku: 'ELC-MTR-750', category: 'Electrical', quantity: 9, minStockLevel: 10, unitPrice: 550.00, isActive: 1 },
  { id: 'p6', name: 'Pressure Gauge PG-100', sku: 'PRE-GAU-100', category: 'Industrial Parts', quantity: 75, minStockLevel: 30, unitPrice: 45.00, isActive: 1 },
];

type Product = typeof MOCK[number];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(MOCK);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', category: '', unitPrice: '', minStockLevel: '', maxStockLevel: '' });

  useEffect(() => {
    api.get('/products').then(r => { const d = r.data.data?.data || r.data.data; if (Array.isArray(d) && d.length) setProducts(d); }).catch(() => {});
  }, []);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));
  const stockStatus = (p: Product) => p.quantity === 0 ? { label: 'Out of Stock', cls: 'badge-red' } : p.quantity <= p.minStockLevel ? { label: 'Low Stock', cls: 'badge-amber' } : { label: 'In Stock', cls: 'badge-green' };

  const handleAdd = async () => {
    if (!form.name || !form.sku) return toast.error('Name and SKU are required');
    try {
      await api.post('/products', { ...form, unitPrice: Number(form.unitPrice), minStockLevel: Number(form.minStockLevel), maxStockLevel: Number(form.maxStockLevel) });
      toast.success('Product created!');
      setShowModal(false);
      setForm({ name: '', sku: '', category: '', unitPrice: '', minStockLevel: '', maxStockLevel: '' });
    } catch { toast.error('Failed to create product'); }
  };

  const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= p.minStockLevel).length;
  const outOfStock = products.filter(p => p.quantity === 0).length;
  const totalValue = products.reduce((s, p) => s + p.quantity * p.unitPrice, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="page-header">
        <div>
          <h1 className="section-title">Product Catalog</h1>
          <p className="section-subtitle">Manage SKUs, categories, pricing, and stock levels</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}><Plus className="w-4 h-4" />Add Product</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Products', value: products.length, color: '#3B82F6' },
          { label: 'Low Stock', value: lowStock, color: '#F59E0B' },
          { label: 'Out of Stock', value: outOfStock, color: '#EF4444' },
          { label: 'Total Value', value: `₹${(totalValue/1000).toFixed(0)}K`, color: '#10B981' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i*0.06 }} className="glass-card p-4">
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input className="input-field pl-10" placeholder="Search by name or SKU..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Product', 'SKU', 'Category', 'Qty', 'Min Stock', 'Unit Price', 'Status'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((p, i) => {
                const status = stockStatus(p);
                return (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i*0.03 }} className="table-row-hover">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Package className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="font-medium text-white text-sm">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-400">{p.sku}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{p.category}</td>
                    <td className="px-6 py-4 text-sm font-bold" style={{ color: p.quantity === 0 ? '#EF4444' : p.quantity <= p.minStockLevel ? '#F59E0B' : '#F9FAFB' }}>{p.quantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{p.minStockLevel}</td>
                    <td className="px-6 py-4 text-sm text-white font-medium">₹{p.unitPrice.toFixed(2)}</td>
                    <td className="px-6 py-4"><span className={status.cls}>{status.label}</span></td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16">
              <Package className="w-12 h-12 text-gray-700" />
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="glass-card w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Add Product</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-400"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Product Name *</label>
                  <input className="input-field" value={form.name} onChange={e => setForm(s => ({...s, name: e.target.value}))} placeholder="Industrial Valve XL-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">SKU *</label>
                  <input className="input-field" value={form.sku} onChange={e => setForm(s => ({...s, sku: e.target.value}))} placeholder="IND-VLV-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Category</label>
                  <input className="input-field" value={form.category} onChange={e => setForm(s => ({...s, category: e.target.value}))} placeholder="Industrial Parts" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Unit Price (₹)</label>
                  <input type="number" className="input-field" value={form.unitPrice} onChange={e => setForm(s => ({...s, unitPrice: e.target.value}))} placeholder="129.99" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Min Stock Level</label>
                  <input type="number" className="input-field" value={form.minStockLevel} onChange={e => setForm(s => ({...s, minStockLevel: e.target.value}))} placeholder="50" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button className="btn-secondary flex-1 justify-center" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn-primary flex-1 justify-center" onClick={handleAdd}><Plus className="w-4 h-4" />Create Product</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}