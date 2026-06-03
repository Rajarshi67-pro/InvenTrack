import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Warehouse, Plus, X, MapPin, TrendingUp, Edit2, Trash2, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../api/client';

const MOCK = [
  { id: 'w1', name: 'Main Distribution Hub', location: 'Mumbai, Maharashtra', capacity: 5000, currentStock: 4200, utilizationPercent: 84, isActive: 1 },
  { id: 'w2', name: 'East Wing Storage', location: 'Kolkata, West Bengal', capacity: 3000, currentStock: 1350, utilizationPercent: 45, isActive: 1 },
  { id: 'w3', name: 'West Coast Depot', location: 'Pune, Maharashtra', capacity: 4000, currentStock: 2880, utilizationPercent: 72, isActive: 1 },
  { id: 'w4', name: 'North Regional Centre', location: 'Delhi, NCR', capacity: 2500, currentStock: 1025, utilizationPercent: 41, isActive: 1 },
];

type WH = typeof MOCK[number];

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<WH[]>(MOCK);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', capacity: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/warehouses')
      .then(r => { const d = r.data.data?.data || r.data.data; if (Array.isArray(d) && d.length) setWarehouses(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!form.name || !form.location) return toast.error('Please fill all required fields');
    try {
      await api.post('/warehouses', { ...form, capacity: Number(form.capacity) });
      toast.success('Warehouse created!');
      setShowModal(false);
      setForm({ name: '', location: '', capacity: '' });
    } catch { toast.error('Failed to create warehouse'); }
  };

  const utilColor = (u: number) => u > 80 ? '#EF4444' : u > 60 ? '#F59E0B' : '#10B981';
  const utilBadge = (u: number) => u > 80 ? 'badge-red' : u > 60 ? 'badge-amber' : 'badge-green';

  const total = warehouses.length;
  const active = warehouses.filter(w => w.isActive === 1).length;
  const totalCap = warehouses.reduce((s, w) => s + w.capacity, 0);
  const avgUtil = Math.round(warehouses.reduce((s, w) => s + w.utilizationPercent, 0) / (warehouses.length || 1));

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="page-header">
        <div>
          <h1 className="section-title">Warehouse Management</h1>
          <p className="section-subtitle">Monitor capacity, utilization, and operations across all facilities</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}><Plus className="w-4 h-4" />Add Warehouse</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Warehouses', value: total, icon: Building2, color: '#3B82F6' },
          { label: 'Active', value: active, icon: Warehouse, color: '#10B981' },
          { label: 'Total Capacity', value: `${totalCap.toLocaleString()} units`, icon: TrendingUp, color: '#8B5CF6' },
          { label: 'Avg Utilization', value: `${avgUtil}%`, icon: TrendingUp, color: '#F59E0B' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass-card h-52 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {warehouses.map((w, i) => (
            <motion.div key={w.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
              className="glass-card p-6 hover:border-white/[0.15] transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Warehouse className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{w.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <MapPin className="w-3 h-3" />{w.location}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {/* Utilization bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500">Utilization</span>
                  <span className="font-semibold" style={{ color: utilColor(w.utilizationPercent) }}>{w.utilizationPercent}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${w.utilizationPercent}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.06 }} style={{ background: utilColor(w.utilizationPercent) }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">{w.currentStock?.toLocaleString() ?? 0} / {w.capacity.toLocaleString()} units</div>
                <span className={utilBadge(w.utilizationPercent)}>
                  {w.utilizationPercent > 80 ? 'High Load' : w.utilizationPercent > 60 ? 'Moderate' : 'Available'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Add Warehouse</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Warehouse Name *</label>
                  <input className="input-field" placeholder="e.g. South Hub" value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Location *</label>
                  <input className="input-field" placeholder="e.g. Chennai, Tamil Nadu" value={form.location} onChange={e => setForm(s => ({ ...s, location: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Capacity (units)</label>
                  <input type="number" className="input-field" placeholder="5000" value={form.capacity} onChange={e => setForm(s => ({ ...s, capacity: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button className="btn-secondary flex-1 justify-center" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn-primary flex-1 justify-center" onClick={handleAdd}><Plus className="w-4 h-4" />Create Warehouse</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}