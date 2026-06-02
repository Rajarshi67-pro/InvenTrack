import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import {
  Package, Warehouse, Truck, DollarSign, AlertTriangle, XCircle,
  ShoppingCart, Bell, TrendingUp, Activity, ArrowUpRight
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';
import { useAuthStore } from '../store/authStore';
import { dashboardApi, forecastingApi, productsApi } from '../api';

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / 40;
    const interval = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(interval); return; }
      setDisplay(Math.floor(start));
    }, 30);
    return () => clearInterval(interval);
  }, [value]);
  return <span>{display.toLocaleString()}</span>;
}

function KPICard({ label, value, icon: Icon, colorClass, glowClass, trend, trendUp, delay = 0 }: any) {
  return (
    <motion.div
      className={`stat-card ${glowClass}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -3 }}
    >
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl ${colorClass} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400'}`}>
            <ArrowUpRight className={`w-3 h-3 ${!trendUp && 'rotate-180'}`} />{trend}
          </span>
        )}
      </div>
      <div className="mt-3">
        <div className="text-3xl font-black text-foreground">
          {typeof value === 'number' ? <AnimatedNumber value={value} /> : value ?? '—'}
        </div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">{label}</div>
      </div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-xl p-3 text-sm">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="text-xs">
          {p.name}: <span className="font-bold">{typeof p.value === 'number' && p.name.includes('₹') ? `₹${p.value.toLocaleString()}` : p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: dashboardApi.getStats });
  const { data: trends } = useQuery({ queryKey: ['inventory-trends'], queryFn: dashboardApi.getInventoryTrends });
  const { data: supplierPerf } = useQuery({ queryKey: ['supplier-performance'], queryFn: dashboardApi.getSupplierPerformance });
  const { data: warehouseUtil } = useQuery({ queryKey: ['warehouse-utilization'], queryFn: dashboardApi.getWarehouseUtilization });
  const { data: oracle } = useQuery({ queryKey: ['oracle-analytics'], queryFn: forecastingApi.getOracleAnalytics });

  const kpis = [
    { label: 'Total Products', value: stats?.totalProducts, icon: Package, colorClass: 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400', glowClass: 'stat-card-glow-blue', trend: '+18 this week', trendUp: true, delay: 0 },
    { label: 'Warehouses', value: stats?.totalWarehouses, icon: Warehouse, colorClass: 'bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400', glowClass: 'stat-card-glow-purple', delay: 0.07 },
    { label: 'Suppliers', value: stats?.totalSuppliers, icon: Truck, colorClass: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400', glowClass: 'stat-card-glow-amber', delay: 0.14 },
    { label: 'Inventory Value', value: stats?.totalInventoryValue ? `₹${(stats.totalInventoryValue / 100000).toFixed(1)}L` : null, icon: DollarSign, colorClass: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400', glowClass: 'stat-card-glow-green', trend: '+12.4%', trendUp: true, delay: 0.21 },
    { label: 'Low Stock Items', value: stats?.lowStockProducts, icon: AlertTriangle, colorClass: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400', glowClass: 'stat-card-glow-amber', trend: 'Needs attention', trendUp: false, delay: 0.28 },
    { label: 'Out of Stock', value: stats?.outOfStockProducts, icon: XCircle, colorClass: 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400', glowClass: 'stat-card-glow-red', delay: 0.35 },
    { label: 'Pending POs', value: stats?.pendingPurchaseOrders, icon: ShoppingCart, colorClass: 'bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400', glowClass: 'stat-card-glow-blue', delay: 0.42 },
    { label: 'Active Alerts', value: stats?.activeAlerts, icon: Bell, colorClass: 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400', glowClass: 'stat-card-glow-red', delay: 0.49 },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.fullName?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Administrator Dashboard · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* KPI Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map(kpi => <KPICard key={kpi.label} {...kpi} />)}
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart — Inventory Trends */}
        <motion.div className="bg-card border border-border rounded-2xl lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-bold text-foreground">Inventory Value Trends</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Last 12 months</p>
            </div>
            <span className="badge-approved text-xs">Live</span>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trends?.monthly || []}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" name="₹ Value" stroke="#3b82f6" fill="url(#colorVal)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Radial — Warehouse Utilization */}
        <motion.div className="bg-card border border-border rounded-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-bold text-foreground">Warehouse Utilization</h3>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={warehouseUtil?.warehouses || []} startAngle={90} endAngle={-270}>
                <RadialBar background={{ fill: 'hsl(var(--muted))' }} dataKey="utilization" />
                <Legend iconSize={8} layout="vertical" verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }} />
                <Tooltip content={<CustomTooltip />} formatter={(v: number) => [`${v}%`, 'Utilization']} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div className="bg-card border border-border rounded-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="px-6 py-4 border-b border-border"><h3 className="font-bold text-foreground">Monthly Stock Movement</h3></div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trends?.monthly || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="in" name="Stock In" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="out" name="Stock Out" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div className="bg-card border border-border rounded-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <div className="px-6 py-4 border-b border-border"><h3 className="font-bold text-foreground">Supplier Performance</h3></div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={supplierPerf?.suppliers || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `${v}%`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={95} />
                <Tooltip content={<CustomTooltip />} formatter={(v: number) => [`${v}%`, 'On-time Delivery']} />
                <Bar dataKey="performance" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Oracle Analytics Panel */}
      {oracle && (
        <motion.div className="bg-card border-l-4 border-l-blue-500 border border-border rounded-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="px-6 py-4 border-b border-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Oracle Analytics Cloud Insights</h3>
              <p className="text-xs text-muted-foreground">AI-powered demand & risk analysis</p>
            </div>
            <span className="ml-auto flex items-center gap-1.5 text-xs font-bold text-blue-400 bg-blue-950/30 border border-blue-800 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />AI Powered
            </span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Prediction Score', value: oracle.predictionScore, color: 'text-emerald-400' },
                { label: 'Shortage Risks', value: `${oracle.shortageRisks} Products`, color: 'text-amber-400' },
                { label: 'Reorder Suggestions', value: `${oracle.reorderRecommendations} Items`, color: 'text-blue-400' },
                { label: 'Optimization Gain', value: oracle.optimizationGain, color: 'text-emerald-400' },
              ].map(m => (
                <div key={m.label} className="bg-muted/40 rounded-2xl p-4 text-center border border-border">
                  <div className={`text-2xl font-black ${m.color}`}>{m.value}</div>
                  <div className="text-xs text-muted-foreground font-semibold mt-1">{m.label}</div>
                </div>
              ))}
            </div>
            {oracle.riskAlerts?.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-foreground mb-3">Risk Alerts</h4>
                <div className="space-y-2">
                  {oracle.riskAlerts.map((a: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border">
                      <AlertTriangle className={`w-4 h-4 ${a.risk === 'HIGH' ? 'text-red-400' : 'text-amber-400'}`} />
                      <span className="font-semibold text-sm text-foreground flex-1">{a.product}</span>
                      <span className={`badge-status text-xs ${a.risk === 'HIGH' ? 'badge-out' : 'badge-low'}`}>{a.risk}</span>
                      <span className="text-xs text-muted-foreground">{a.daysToStockout} days to stockout</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
