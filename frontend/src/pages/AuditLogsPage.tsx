import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Search, Shield, LogIn, Package, Truck, ShoppingCart, Settings } from 'lucide-react';
import { api } from '../api/client';

const MOCK_LOGS = [
  { id: '1', action: 'LOGIN', entityType: 'AUTH', userId: 'demo-admin-id', userName: 'Demo Admin', status: 'SUCCESS', ipAddress: '192.168.1.1', createdAt: '2026-06-03 12:00:00' },
  { id: '2', action: 'CREATE', entityType: 'PRODUCT', userId: 'demo-admin-id', userName: 'Demo Admin', entityId: 'p1', status: 'SUCCESS', createdAt: '2026-06-03 11:30:00' },
  { id: '3', action: 'UPDATE', entityType: 'WAREHOUSE', userId: 'demo-manager-id', userName: 'Demo Manager', status: 'SUCCESS', createdAt: '2026-06-03 10:15:00' },
  { id: '4', action: 'APPROVE', entityType: 'PURCHASE_ORDER', userId: 'demo-admin-id', userName: 'Demo Admin', status: 'SUCCESS', createdAt: '2026-06-02 16:00:00' },
  { id: '5', action: 'LOGIN', entityType: 'AUTH', userId: 'demo-manager-id', userName: 'Demo Manager', status: 'SUCCESS', ipAddress: '192.168.1.2', createdAt: '2026-06-02 09:00:00' },
];

type Log = typeof MOCK_LOGS[number];

const ACTION_ICON: Record<string, React.ElementType> = {
  LOGIN: LogIn, CREATE: Package, UPDATE: Settings, DELETE: Package, APPROVE: Shield, REGISTER: Shield
};

const ACTION_COLOR: Record<string, string> = {
  LOGIN: '#3B82F6', CREATE: '#10B981', UPDATE: '#F59E0B', DELETE: '#EF4444', APPROVE: '#8B5CF6'
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<Log[]>(MOCK_LOGS);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/dashboard/audit-logs').then(r => { const d = r.data.data?.data || r.data.data; if (Array.isArray(d) && d.length) setLogs(d); }).catch(() => {});
  }, []);

  const filtered = logs.filter(l =>
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.entityType?.toLowerCase().includes(search.toLowerCase()) ||
    l.userName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-8">
        <h1 className="section-title">Audit Logs</h1>
        <p className="section-subtitle">Complete trail of all system actions and changes</p>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input className="input-field pl-10" placeholder="Search by action, entity or user..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Action','Entity','User','Status','IP Address','Timestamp'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.map((log, i) => {
              const Icon = ACTION_ICON[log.action] || ClipboardList;
              const color = ACTION_COLOR[log.action] || '#9CA3AF';
              return (
                <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i*0.04 }} className="table-row-hover">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                      </div>
                      <span className="text-sm font-semibold text-white">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="badge-gray text-xs">{log.entityType}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-300">{log.userName}</td>
                  <td className="px-6 py-4"><span className={log.status === 'SUCCESS' ? 'badge-green' : 'badge-red'}>{log.status}</span></td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-500">{log.ipAddress || '—'}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">{log.createdAt}</td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}