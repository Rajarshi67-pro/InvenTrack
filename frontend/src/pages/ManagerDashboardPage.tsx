import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, AlertTriangle, Bell, ShoppingCart, FileText, Package, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuthStore } from '../store/authStore';
import { dashboardApi, productsApi } from '../api';

function QuickActionCard({ icon: Icon, title, description, to, color }: any) {
  return (
    <Link to={to}>
      <motion.div className="stat-card group cursor-pointer" whileHover={{ y: -4, scale: 1.01 }} transition={{ duration: 0.2 }}>
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-foreground text-sm mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
        <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
          Go to module <ArrowRight className="w-3 h-3" />
        </div>
      </motion.div>
    </Link>
  );
}

export default function ManagerDashboardPage() {
  const { user } = useAuthStore();
  const { data: stats } = useQuery({ queryKey: ['dashboard-stats'], queryFn: dashboardApi.getStats });
  const { data: trends } = useQuery({ queryKey: ['inventory-trends'], queryFn: dashboardApi.getInventoryTrends });
  const { data: lowStock } = useQuery({ queryKey: ['products-low-stock'], queryFn: () => productsApi.getAll({ stockStatus: 'LOW_STOCK', limit: 8 }) });

  const kpis = [
    { label: "Today's Receipts", value: 12, icon: ArrowDownCircle, color: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400', delay: 0 },
    { label: "Today's Dispatches", value: 8, icon: ArrowUpCircle, color: 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400', delay: 0.07 },
    { label: 'Pending Transfers', value: 3, icon: ArrowLeftRight, color: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400', delay: 0.14 },
    { label: 'Low Stock Alerts', value: stats?.lowStockProducts, icon: AlertTriangle, color: 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400', delay: 0.21 },
    { label: 'Active Notifications', value: stats?.activeAlerts, icon: Bell, color: 'bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400', delay: 0.28 },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Operations Dashboard</h1>
          <p className="page-subtitle">Welcome, {user?.fullName?.split(' ')[0]} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, delay }) => (
          <motion.div key={label} className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
            <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-foreground">{value ?? '—'}</div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Movement Chart */}
        <motion.div className="bg-card border border-border rounded-2xl" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-bold text-foreground">Monthly Stock Movement</h3>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trends?.monthly || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="in" name="Stock In" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="out" name="Stock Out" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Low Stock Table */}
        <motion.div className="bg-card border border-border rounded-2xl" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-foreground">Low Stock Items</h3>
            <Link to="/inventory" className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="overflow-hidden">
            <table className="data-table">
              <thead><tr><th>Product</th><th>SKU</th><th>Qty</th><th>Min</th></tr></thead>
              <tbody>
                {(lowStock?.data || []).slice(0, 6).map((p: any) => (
                  <tr key={p.id}>
                    <td className="font-medium text-foreground max-w-[120px] truncate">{p.name}</td>
                    <td><span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{p.sku}</span></td>
                    <td><span className={`font-bold text-sm ${p.quantity === 0 ? 'text-red-500' : 'text-amber-500'}`}>{p.quantity}</span></td>
                    <td className="text-muted-foreground">{p.minStockLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <h2 className="text-lg font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard icon={ArrowDownCircle} title="Record Stock In" description="Receive and log incoming inventory" to="/inventory" color="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" />
          <QuickActionCard icon={ArrowUpCircle} title="Record Stock Out" description="Issue and log outgoing inventory" to="/inventory" color="bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400" />
          <QuickActionCard icon={ShoppingCart} title="Create Purchase Order" description="Submit new PO for approval" to="/purchase-orders" color="bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400" />
          <QuickActionCard icon={FileText} title="View Reports" description="Download inventory & supplier reports" to="/reports" color="bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400" />
        </div>
      </motion.div>
    </div>
  );
}
