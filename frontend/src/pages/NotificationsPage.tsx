import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, Truck, ShoppingCart, Brain, CheckCheck, Trash2 } from 'lucide-react';

const MOCK_NOTIFS = [
  { id: '1', type: 'LOW_STOCK', title: 'Low Stock Alert', message: 'Hydraulic Pump HP-300 is below minimum stock level (18 units remaining)', time: '2 min ago', read: false, icon: AlertTriangle, color: '#F59E0B' },
  { id: '2', type: 'SHIPMENT', title: 'Shipment In Transit', message: 'SHP-2026-001 from TechCorp Industries is now in transit. Expected delivery: Jun 10', time: '1 hour ago', read: false, icon: Truck, color: '#3B82F6' },
  { id: '3', type: 'PO_APPROVAL', title: 'Purchase Order Pending', message: 'PO-2026-003 requires your approval. Total value: ₹3,360', time: '3 hours ago', read: false, icon: ShoppingCart, color: '#8B5CF6' },
  { id: '4', type: 'FORECAST', title: 'AI Forecast Alert', message: 'Demand spike predicted for Industrial Valve XL-500 in July. Recommend reorder.', time: '5 hours ago', read: true, icon: Brain, color: '#10B981' },
  { id: '5', type: 'LOW_STOCK', title: 'Out of Stock', message: 'Conveyor Belt CB-12 is completely out of stock. Immediate action required.', time: '1 day ago', read: true, icon: AlertTriangle, color: '#EF4444' },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFS);

  const unread = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  const remove = (id: string) => setNotifications(ns => ns.filter(n => n.id !== id));

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-3xl">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="section-title">Notifications</h1>
            {unread > 0 && <span className="badge-blue">{unread} new</span>}
          </div>
          <p className="section-subtitle">Real-time alerts and system notifications</p>
        </div>
        {unread > 0 && (
          <button className="btn-secondary" onClick={markAllRead}><CheckCheck className="w-4 h-4" />Mark all read</button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 && (
          <div className="glass-card p-16 flex flex-col items-center gap-3">
            <Bell className="w-12 h-12 text-gray-700" />
            <p className="text-gray-500 font-medium">No notifications</p>
          </div>
        )}
        {notifications.map((n, i) => (
          <motion.div key={n.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i*0.05 }}
            className={`glass-card p-4 flex items-start gap-4 cursor-pointer transition-all duration-200 hover:border-white/[0.15] ${
              !n.read ? 'border-l-2' : ''
            }`}
            style={!n.read ? { borderLeftColor: n.color } : {}}
            onClick={() => markRead(n.id)}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${n.color}15` }}>
              <n.icon className="w-5 h-5" style={{ color: n.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-semibold ${n.read ? 'text-gray-400' : 'text-white'}`}>{n.title}</p>
                {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
              </div>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
              <p className="text-[11px] text-gray-600 mt-1.5">{n.time}</p>
            </div>
            <button onClick={e => { e.stopPropagation(); remove(n.id); }}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-colors flex-shrink-0">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}