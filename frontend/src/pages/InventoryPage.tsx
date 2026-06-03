import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Plus, ArrowUp, ArrowDown, RefreshCw, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../api/client';

const MOCK_MOVEMENTS = [
  { id: 'm1', type: 'IN', productName: 'Industrial Valve XL-500', sku: 'IND-VLV-500', quantity: 100, warehouseName: 'Main Distribution Hub', reference: 'PO-2026-001', createdAt: '2026-06-03 09:00' },
  { id: 'm2', type: 'OUT', productName: 'Safety Helmet Pro', sku: 'SAF-HLM-PRO', quantity: 25, warehouseName: 'West Coast Depot', reference: 'SHP-2026-002', createdAt: '2026-06-03 10:30' },
  { id: 'm3', type: 'IN', productName: 'Electric Motor EM-750W', sku: 'ELC-MTR-750', quantity: 15, warehouseName: 'North Regional Centre', reference: 'PO-2026-002', createdAt: '2026-06-02 14:15' },
  { id: 'm4', type: 'ADJUSTMENT', productName: 'Hydraulic Pump HP-300', sku: 'HYD-PMP-300', quantity: -5, warehouseName: 'East Wing Storage', reference: 'ADJ-001', createdAt: '2026-06-02 16:00' },
  { id: 'm5', type: 'TRANSFER', productName: 'Pressure Gauge PG-100', sku: 'PRE-GAU-100', quantity: 30, warehouseName: 'Main Distribution Hub → East Wing', reference: 'TRF-001', createdAt: '2026-06-01 11:00' },
];

type Movement = typeof MOCK_MOVEMENTS[number];

const TYPE_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  IN: { color: '#10B981', bg: 'bg-emerald-500/10', icon: ArrowUp, label: 'Stock In' },
  OUT: { color: '#EF4444', bg: 'bg-red-500/10', icon: ArrowDown, label: 'Stock Out' },
  ADJUSTMENT: { color: '#F59E0B', bg: 'bg-amber-500/10', icon: RefreshCw, label: 'Adjustment' },
  TRANSFER: { color: '#8B5CF6', bg: 'bg-purple-500/10', icon: ArrowUp, label: 'Transfer' },
};

export default function InventoryPage() {
  const [movements, setMovements] = useState<Movement[]>(MOCK_MOVEMENTS);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showStockIn, setShowStockIn] = useState(false);
  const [form, setForm] = useState({ productId: '', quantity: '', warehouseId: '', notes: '' });

  useEffect(() => {
    api.get('/inventory/movements').then(r => { const d = r.data.data?.data || r.data.data; if (Array.isArray(d) && d.length) setMovements(d); }).catch(() => {});
  }, []);

  const filtered = movements.filter(m =>
    (typeFilter === 'ALL' || m.type === typeFilter) &&
    (m.productName?.toLowerCase().includes(search.toLowerCase()) || m.sku?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleStockIn = async () => {
    if (!form.productId || !form.quantity) return toast.error('Product and quantity are required');
    try {
      await api.post('/inventory/stock-in', { ...form, quantity: Number(form.quantity) });
      toast.success('Stock recorded!');
      setShowStockIn(false);
      setForm({ productId: '', quantity: '', warehouseId: '', notes: '' });
    } catch { toast.error('Failed to record stock'); }
  };

  const totalIn = movements.filter(m => m.type === 'IN').reduce((s, m) => s + Math.abs(m.quantity), 0);
  const totalOut = movements.filter(m => m.type === 'OUT').reduce((s, m) => s + Math.abs(m.quantity), 0);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="page-header">
        <div>
          <h1 className="section-title">Inventory Management</h1>
          <p className="section-subtitle">Real-time stock movements, adjustments, and levels</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={() => setShowStockIn(false)}><ArrowDown className="w-4 h-4" />Stock Out</button>
          <button className="btn-primary" onClick={() => setShowStockIn(true)}><Plus className="w-4 h-4" />Stock In</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Movements', value: movements.length, color: '#3B82F6' },
          { label: 'Total Stock In', value: totalIn, color: '#10B981' },
          { label: 'Total Stock Out', value: totalOut, color: '#EF4444' },
          { label: 'Adjustments', value: movements.filter(m=>m.type==='ADJUSTMENT').length, color: '#F59E0B' },
        ].map((s,i) => (
          <motion.div key={s.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i*0.06 }} className="glass-card p-4">
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input className="input-field pl-10" placeholder="Search by product or SKU..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['ALL','IN','OUT','ADJUSTMENT','TRANSFER'].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                typeFilter === t ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Type','Product','SKU','Quantity','Warehouse','Reference','Date'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((m, i) => {
                const cfg = TYPE_CONFIG[m.type] || TYPE_CONFIG.IN;
                return (
                  <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i*0.03 }} className="table-row-hover">
                    <td className="px-6 py-4">
                      <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                        <cfg.icon className="w-4 h-4" style={{ color: cfg.color }} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white">{m.productName}</td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">{m.sku}</td>
                    <td className="px-6 py-4 text-sm font-bold" style={{ color: m.quantity < 0 ? '#EF4444' : '#10B981' }}>
                      {m.quantity > 0 ? '+' : ''}{m.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{m.warehouseName}</td>
                    <td className="px-6 py-4 text-xs font-mono text-blue-400">{m.reference}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">{m.createdAt}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showStockIn && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowStockIn(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-5">Record Stock In</h3>
            <div className="space-y-4">
              <div><label className="block text-xs font-medium text-gray-400 mb-1.5">Product SKU</label>
                <input className="input-field" value={form.productId} onChange={e => setForm(s => ({...s, productId: e.target.value}))} placeholder="Enter SKU" /></div>
              <div><label className="block text-xs font-medium text-gray-400 mb-1.5">Quantity</label>
                <input type="number" className="input-field" value={form.quantity} onChange={e => setForm(s => ({...s, quantity: e.target.value}))} placeholder="100" /></div>
              <div><label className="block text-xs font-medium text-gray-400 mb-1.5">Notes</label>
                <input className="input-field" value={form.notes} onChange={e => setForm(s => ({...s, notes: e.target.value}))} placeholder="Optional" /></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button className="btn-secondary flex-1 justify-center" onClick={() => setShowStockIn(false)}>Cancel</button>
              <button className="btn-primary flex-1 justify-center" onClick={handleStockIn}><Plus className="w-4 h-4" />Record</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}