import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ClipboardList, User, ArrowDownCircle, ArrowUpCircle, ShoppingCart,
  Edit2, LogIn, Search, Download, ChevronLeft, ChevronRight
} from 'lucide-react';
import { dashboardApi } from '../api';

const ACTION_ICONS: Record<string, { icon: any; color: string }> = {
  LOGIN: { icon: LogIn, color: 'text-blue-400 bg-blue-400/10' },
  LOGOUT: { icon: LogIn, color: 'text-slate-400 bg-slate-400/10' },
  STOCK_IN: { icon: ArrowDownCircle, color: 'text-emerald-400 bg-emerald-400/10' },
  STOCK_OUT: { icon: ArrowUpCircle, color: 'text-red-400 bg-red-400/10' },
  CREATE_PO: { icon: ShoppingCart, color: 'text-amber-400 bg-amber-400/10' },
  PO_STATUS_DELIVERED: { icon: ShoppingCart, color: 'text-emerald-400 bg-emerald-400/10' },
  UPDATE_PRODUCT: { icon: Edit2, color: 'text-violet-400 bg-violet-400/10' },
  CREATE_WAREHOUSE: { icon: ClipboardList, color: 'text-blue-400 bg-blue-400/10' },
};

export default function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, search, action],
    queryFn: () => dashboardApi.getAuditLogs({ page, limit: 20, search: search || undefined }),
  });

  const logs: any[] = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const filtered = logs.filter(log => {
    if (action && log.action !== action) return false;
    if (fromDate && new Date(log.createdAt) < new Date(fromDate)) return false;
    if (toDate && new Date(log.createdAt) > new Date(toDate + 'T23:59:59')) return false;
    return true;
  });

  const exportCSV = () => {
    const rows = [['Time', 'User', 'Action', 'Entity', 'Status', 'IP']];
    filtered.forEach(l => rows.push([l.createdAt, l.user?.fullName || l.userId, l.action, l.entityType, l.status, l.ipAddress]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const ACTIONS = ['LOGIN', 'LOGOUT', 'STOCK_IN', 'STOCK_OUT', 'CREATE_PO', 'PO_STATUS_DELIVERED', 'UPDATE_PRODUCT', 'CREATE_WAREHOUSE'];

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Trail</h1>
          <p className="page-subtitle">Complete log of all system actions — {total} records</p>
        </div>
        <button onClick={exportCSV} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">
          <Download className="w-4 h-4" />Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search actions or entities…" className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <select value={action} onChange={e => setAction(e.target.value)} className="px-3 py-2 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">All Actions</option>
            {ACTIONS.map(a => <option key={a}>{a}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="px-3 py-2 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <span className="text-muted-foreground text-sm">to</span>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="px-3 py-2 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          {(action || fromDate || toDate) && (
            <button onClick={() => { setAction(''); setFromDate(''); setToDate(''); }} className="px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">Clear</button>
          )}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Entity</th><th>IP Address</th><th>Status</th></tr></thead>
            <tbody>
              {isLoading ? [...Array(8)].map((_, i) => <tr key={i}><td colSpan={6}><div className="h-12 skeleton rounded my-1" /></td></tr>) :
                filtered.map((log: any, idx: number) => {
                  const { icon: Icon, color } = ACTION_ICONS[log.action] || { icon: ClipboardList, color: 'text-muted-foreground bg-muted' };
                  return (
                    <motion.tr key={log.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                      <td className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                        <br />
                        {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg ${color.split(' ')[1]} flex items-center justify-center flex-shrink-0`}>
                            <User className={`w-3.5 h-3.5 ${color.split(' ')[0]}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm text-foreground truncate max-w-[120px]">{log.user?.fullName || 'System'}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[120px]">{log.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color.split(' ')[1]}`}>
                            <Icon className={`w-3.5 h-3.5 ${color.split(' ')[0]}`} />
                          </div>
                          <span className="font-mono text-xs font-bold text-foreground">{log.action}</span>
                        </div>
                      </td>
                      <td>
                        <div className="text-xs">
                          <span className="font-semibold text-foreground">{log.entityType}</span>
                          {log.entityId && <div className="text-muted-foreground font-mono truncate max-w-[100px]">{log.entityId}</div>}
                        </div>
                      </td>
                      <td><span className="font-mono text-xs text-muted-foreground">{log.ipAddress}</span></td>
                      <td>
                        <span className={`flex items-center gap-1 text-xs font-bold ${log.status === 'SUCCESS' ? 'text-emerald-500' : 'text-red-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {log.status}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Page {page} of {totalPages} · {total} records</p>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="flex items-center gap-1 px-3 py-2 rounded-xl border border-input text-sm disabled:opacity-40 hover:bg-muted"><ChevronLeft className="w-4 h-4" />Prev</button>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="flex items-center gap-1 px-3 py-2 rounded-xl border border-input text-sm disabled:opacity-40 hover:bg-muted">Next<ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}