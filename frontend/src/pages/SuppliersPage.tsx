import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Star, TrendingUp, Phone, Mail, Plus, Search, Activity } from 'lucide-react';
import { api } from '../api/client';

const MOCK = [
  { id: 's1', name: 'TechCorp Industries', contactName: 'Rahul Sharma', email: 'rahul@techcorp.in', phone: '+91-9876543210', country: 'India', deliveryPerformance: 98, rating: 4.8, isActive: 1 },
  { id: 's2', name: 'Global Supply Chain Ltd', contactName: 'Priya Mehta', email: 'priya@globalsupply.com', phone: '+91-9123456789', country: 'India', deliveryPerformance: 92, rating: 4.2, isActive: 1 },
  { id: 's3', name: 'FastLogistics Co.', contactName: 'Amit Bose', email: 'amit@fastlogistics.in', phone: '+91-9988776655', country: 'India', deliveryPerformance: 85, rating: 3.9, isActive: 1 },
  { id: 's4', name: 'Allied Manufacturing', contactName: 'Sneha Roy', email: 'sneha@alliedmfg.com', phone: '+91-9000112233', country: 'India', deliveryPerformance: 76, rating: 3.5, isActive: 1 },
  { id: 's5', name: 'Rapid Parts Pvt Ltd', contactName: 'Vikram Singh', email: 'vikram@rapidparts.in', phone: '+91-8800990011', country: 'India', deliveryPerformance: 88, rating: 4.0, isActive: 1 },
];

type Supplier = typeof MOCK[number];

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/suppliers').then(r => { const d = r.data.data?.data || r.data.data; if (Array.isArray(d) && d.length) setSuppliers(d); }).catch(() => {});
  }, []);

  const filtered = suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.contactName?.toLowerCase().includes(search.toLowerCase()));

  const perfColor = (p: number) => p >= 95 ? '#10B981' : p >= 80 ? '#3B82F6' : p >= 70 ? '#F59E0B' : '#EF4444';
  const perfBadge = (p: number) => p >= 95 ? 'badge-green' : p >= 80 ? 'badge-blue' : p >= 70 ? 'badge-amber' : 'badge-red';

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="page-header">
        <div>
          <h1 className="section-title">Supplier Management</h1>
          <p className="section-subtitle">Track supplier performance, contracts, and relationships</p>
        </div>
        <button className="btn-primary"><Plus className="w-4 h-4" />Add Supplier</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Suppliers', value: suppliers.length, color: '#3B82F6' },
          { label: 'Active Partners', value: suppliers.filter(s => s.isActive).length, color: '#10B981' },
          { label: 'Avg Performance', value: `${Math.round(suppliers.reduce((a,s) => a + s.deliveryPerformance, 0) / (suppliers.length||1))}%`, color: '#8B5CF6' },
          { label: 'Avg Rating', value: (suppliers.reduce((a,s) => a + s.rating, 0) / (suppliers.length||1)).toFixed(1), color: '#F59E0B' },
        ].map((s,i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.06 }} className="glass-card p-5">
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input className="input-field pl-10" placeholder="Search suppliers..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.06 }}
            className="glass-card p-5 hover:border-white/[0.15] transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                {s.name.charAt(0)}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-sm font-semibold text-white">{s.rating.toFixed(1)}</span>
              </div>
            </div>
            <h3 className="font-semibold text-white mb-0.5">{s.name}</h3>
            <p className="text-xs text-gray-500 mb-4">{s.contactName}</p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Mail className="w-3.5 h-3.5" />{s.email}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Phone className="w-3.5 h-3.5" />{s.phone}
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
              <div>
                <p className="text-xs text-gray-500">Delivery Performance</p>
                <div className="h-1.5 w-24 rounded-full bg-white/5 mt-1.5">
                  <div className="h-full rounded-full" style={{ width: `${s.deliveryPerformance}%`, background: perfColor(s.deliveryPerformance) }} />
                </div>
              </div>
              <span className={perfBadge(s.deliveryPerformance)}>{s.deliveryPerformance}%</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}