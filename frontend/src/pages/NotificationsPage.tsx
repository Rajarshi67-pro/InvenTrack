import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Bell, Check, CheckCheck, Trash2, AlertTriangle, XCircle, ShoppingCart, TrendingUp, Archive } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { notificationsApi } from '../api';
import { useUIStore } from '../store/uiStore';

const SEVERITY_BADGE: Record<string, string> = {
  CRITICAL: 'badge-out', HIGH: 'badge-low', MEDIUM: 'badge-approved', LOW: 'badge-draft',
};
const TYPE_ICON: Record<string, { icon: any; color: string }> = {
  LOW_STOCK: { icon: AlertTriangle, color: 'text-amber-500 bg-amber-500/10' },
  OUT_OF_STOCK: { icon: XCircle, color: 'text-red-500 bg-red-500/10' },
  PO_CREATED: { icon: ShoppingCart, color: 'text-blue-500 bg-blue-500/10' },
  FORECAST_WARNING: { icon: TrendingUp, color: 'text-violet-500 bg-violet-500/10' },
  OVERSTOCK: { icon: Archive, color: 'text-indigo-500 bg-indigo-500/10' },
};

const TYPE_LABELS = ['LOW_STOCK', 'OUT_OF_STOCK', 'PO_CREATED', 'FORECAST_WARNING', 'OVERSTOCK'] as const;

export default function NotificationsPage() {
  const qc = useQueryClient();
  const { setUnreadNotifications } = useUIStore();
  const [typeFilter, setTypeFilter] = useState('');
  const [readFilter, setReadFilter] = useState<'' | '0' | '1'>('');

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', typeFilter, readFilter],
    queryFn: () => notificationsApi.getAll({ limit: 50, ...(readFilter !== '' ? { isRead: readFilter } : {}) }),
  });

  useEffect(() => {
    const unread = (data?.data || []).filter((n: any) => !n.isRead).length || 0;
    setUnreadNotifications(unread);
  }, [data]);

  const markReadMut = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
  const markAllMut = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => { toast.success('All notifications marked as read'); qc.invalidateQueries({ queryKey: ['notifications'] }); setUnreadNotifications(0); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSuccess: () => { toast.success('Notification deleted'); qc.invalidateQueries({ queryKey: ['notifications'] }); },
  });

  const notifications: any[] = (data?.data || []).filter((n: any) => !typeFilter || n.type === typeFilter);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notification Center</h1>
          <p className="page-subtitle">{unreadCount} unread notifications</p>
        </div>
        <button onClick={() => markAllMut.mutate()} disabled={markAllMut.isPending || unreadCount === 0} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-40">
          <CheckCheck className="w-4 h-4" />Mark All Read
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => { setTypeFilter(''); setReadFilter(''); }} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${!typeFilter && !readFilter ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}>
          All ({notifications.length})
        </button>
        <button onClick={() => setReadFilter('0')} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${readFilter === '0' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}>
          Unread ({unreadCount})
        </button>
        {TYPE_LABELS.map(t => {
          const { icon: Icon, color } = TYPE_ICON[t] || {};
          return (
            <button key={t} onClick={() => setTypeFilter(typeFilter === t ? '' : t)} className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${typeFilter === t ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}>
              {Icon && <Icon className="w-3 h-3" />}{t.replace('_', ' ')}
            </button>
          );
        })}
      </div>

      {/* Notifications Feed */}
      <div className="space-y-2">
        {isLoading ? [...Array(5)].map((_, i) => <div key={i} className="h-20 skeleton rounded-2xl" />) :
          notifications.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-card border border-border rounded-2xl">
              <Bell className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-lg font-bold text-foreground">All caught up!</p>
              <p className="text-sm text-muted-foreground mt-1">No notifications at this time</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {notifications.map((n: any, idx: number) => {
                const { icon: Icon, color } = TYPE_ICON[n.type] || { icon: Bell, color: 'text-muted-foreground bg-muted' };
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 50, height: 0, marginBottom: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.2 }}
                    className={`bg-card border rounded-2xl p-4 flex items-start gap-4 transition-all ${!n.isRead ? 'border-primary/20 bg-primary/3' : 'border-border'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-foreground text-sm">{n.title}</h4>
                          {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />}
                          <span className={`${SEVERITY_BADGE[n.severity] || 'badge-draft'} text-xs`}>{n.severity}</span>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{n.message}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {!n.isRead && (
                        <button onClick={() => markReadMut.mutate(n.id)} title="Mark as read" className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => { if (confirm('Delete notification?')) deleteMut.mutate(n.id); }} title="Delete" className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
      </div>
    </div>
  );
}