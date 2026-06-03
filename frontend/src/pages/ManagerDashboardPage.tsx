import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, Truck, ShoppingCart, AlertTriangle, ArrowUp, ArrowDown, Clock } from 'lucide-react';
import { api } from '../api/client';

const DAILY_TREND = Array.from({ length: 7 }, (_, i) => ({
  day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],
  receipts: Math.floor(Math.random() * 80 + 20),
  dispatches: Math.floor(Math.random() * 60 + 15),
}));

const ALERT_ITEMS = [
  { name: 'Hydraulic Pump HP-300', qty: 18, min: 20, severity: 'LOW' },
  { name: 'Electric Motor EM-750W', qty: 9, min: 10, severity: 'LOW' },
  { name: 'Conveyor Belt CB-12', qty: 0, min: 5, severity: 'OUT' },
];

export default function ManagerDashboardPage() {
  const [stats, setStats] = useState({ totalProducts: 128, lowStockProducts: 3, pendingPurchaseOrders: 8, incomingShipments: 5, outOfStockProducts: 1 });

  useEffect(() => {
    api.get('/dashboard/stats').then(r => r.data.data && setStats(r.data.data)).catch(() => {});
  }, []);

  const STAT_CARDS = [
    { title: "Today's Receipts", value: 24, icon: ArrowUp, color: '#10B981', sub: 'Items received today' },
    { title: "Today's Dispatches", value: 17, icon: ArrowDown, color: '#3B82F6', sub: 'Items dispatched' },
    { title: 'Pending Deliveries', value: stats.incomingShipments, icon: Truck, color: '#F59E0B', sub: 'In transit' },
    { title: 'Low Stock Alerts', value: stats.lowStockProducts, icon: AlertTriangle, color: '#EF4444', sub: 'Needs reorder' },
    { title: 'Open POs', value: stats.pendingPurchaseOrders, icon: ShoppingCart, color: '#8B5CF6', sub: 'Awaiting delivery' },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-white">Operations Dashboard</h1>
        <p className="text-gray-500 text-sm">Today's warehouse and inventory overview</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {STAT_CARDS.map((c, i) => (
          <motion.div key={c.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.07 }}
            className="glass-card p-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${c.color}15` }}>
              <c.icon className="w-4.5 h-4.5" style={{ color: c.color }} />
            </div>
            <div className="text-2xl font-bold text-white">{c.value}</div>
            <div className="text-xs font-medium text-gray-400 mt-0.5">{c.title}</div>
            <div className="text-xs text-gray-600 mt-0.5">{c.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily trend */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6">
          <h3 className="font-semibold text-white mb-1">Weekly Stock Movement</h3>
          <p className="text-xs text-gray-500 mb-5">Receipts vs Dispatches this week</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={DAILY_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0D1424', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }} />
              <Bar dataKey="receipts" fill="#10B981" radius={[4,4,0,0]} />
              <Bar dataKey="dispatches" fill="#3B82F6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Low stock alerts */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <h3 className="font-semibold text-white mb-1">Critical Stock Alerts</h3>
          <p className="text-xs text-gray-500 mb-5">Items requiring immediate attention</p>
          <div className="space-y-3">
            {ALERT_ITEMS.map(item => (
              <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.severity === 'OUT' ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                    <AlertTriangle className="w-4 h-4" style={{ color: item.severity === 'OUT' ? '#EF4444' : '#F59E0B' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className="text-xs text-gray-500">Min: {item.min} units</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold" style={{ color: item.severity === 'OUT' ? '#EF4444' : '#F59E0B' }}>{item.qty}</div>
                  <span className={item.severity === 'OUT' ? 'badge-red' : 'badge-amber'}>{item.severity === 'OUT' ? 'Out of Stock' : 'Low Stock'}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
