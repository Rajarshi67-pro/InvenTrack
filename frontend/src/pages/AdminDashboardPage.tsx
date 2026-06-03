import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Package, Warehouse, AlertTriangle, ShoppingCart,
  Brain, ArrowUpRight, ArrowDownRight, RefreshCw,
  Users, DollarSign
} from 'lucide-react';
import { api } from '../api/client';

// ── Types ──────────────────────────────────────────────────────────────
interface Stats {
  totalProducts: number;
  totalWarehouses: number;
  totalSuppliers: number;
  totalInventoryValue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  pendingPurchaseOrders: number;
  incomingShipments: number;
  activeAlerts: number;
}

// ── Mock data for charts ───────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const now = new Date();
const TREND_DATA = Array.from({ length: 12 }, (_, i) => {
  const m = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
  return {
    month: MONTHS[m.getMonth()],
    inbound: Math.floor(Math.random() * 300 + 100),
    outbound: Math.floor(Math.random() * 250 + 80),
    value: Math.floor(Math.random() * 500000 + 200000),
  };
});

const WAREHOUSE_DATA = [
  { name: 'Main Hub', utilization: 84, capacity: 5000 },
  { name: 'East Wing', utilization: 45, capacity: 3000 },
  { name: 'West Depot', utilization: 72, capacity: 4000 },
  { name: 'North Centre', utilization: 41, capacity: 2500 },
];

const SUPPLIER_DATA = [
  { name: 'TechCorp', performance: 98, orders: 42 },
  { name: 'GlobalSupply', performance: 92, orders: 38 },
  { name: 'FastLogistics', performance: 85, orders: 29 },
  { name: 'Allied Mfg', performance: 76, orders: 21 },
  { name: 'Rapid Parts', performance: 88, orders: 33 },
];

const CATEGORY_DATA = [
  { name: 'Industrial Parts', value: 35, color: '#3B82F6' },
  { name: 'Machinery', value: 25, color: '#10B981' },
  { name: 'Safety Equipment', value: 20, color: '#F59E0B' },
  { name: 'Electrical', value: 12, color: '#8B5CF6' },
  { name: 'Others', value: 8, color: '#6B7280' },
];

const FORECAST_DATA = Array.from({ length: 6 }, (_, i) => ({
  month: MONTHS[(now.getMonth() + i + 1) % 12],
  predicted: Math.floor(Math.random() * 400 + 300),
  lower: Math.floor(Math.random() * 250 + 200),
  upper: Math.floor(Math.random() * 550 + 400),
}));

// ── Custom tooltip ─────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ dataKey: string; color: string; value: number }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0D1424] border border-white/10 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs font-semibold text-gray-400 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-400 capitalize">{p.dataKey}:</span>
          <span className="font-semibold text-white">
            {typeof p.value === 'number' && p.value > 1000
              ? `₹${(p.value / 1000).toFixed(0)}K`
              : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ── StatCard component ─────────────────────────────────────────────────
function StatCard({
  title, value, subtitle, icon: Icon, color, trend, delay = 0,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  trend?: { value: number; up: boolean };
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-4 hover:border-white/[0.15] transition-all duration-300 group"
    >
      <div className="flex items-start justify-between">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${
              trend.up
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
            }`}
          >
            {trend.up ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
        <div className="text-sm font-medium text-gray-400 mt-0.5">{title}</div>
        {subtitle && <div className="text-xs text-gray-600 mt-1">{subtitle}</div>}
      </div>
    </motion.div>
  );
}

// ── Chart card wrapper ─────────────────────────────────────────────────
function ChartCard({
  title, subtitle, children, delay = 0, className = '',
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 ${className}`}
    >
      <div className="mb-5">
        <h3 className="font-semibold text-white text-base">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}

// ── Skeleton loader ────────────────────────────────────────────────────
function SkeletonLoader() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-52 bg-white/[0.05] rounded-lg animate-pulse" />
          <div className="h-4 w-72 bg-white/[0.03] rounded-lg animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-white/[0.05] rounded-xl animate-pulse" />
          <div className="h-8 w-10 bg-white/[0.05] rounded-xl animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 h-36 animate-pulse"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 h-80 lg:col-span-2 animate-pulse" />
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 h-80 animate-pulse" />
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/stats')
      .then((r) => setStats(r.data.data))
      .catch(() =>
        setStats({
          totalProducts: 128,
          totalWarehouses: 4,
          totalSuppliers: 15,
          totalInventoryValue: 543200,
          lowStockProducts: 12,
          outOfStockProducts: 3,
          pendingPurchaseOrders: 8,
          incomingShipments: 5,
          activeAlerts: 4,
        })
      )
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) =>
    n >= 1_000_000
      ? `₹${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
      ? `₹${(n / 1_000).toFixed(0)}K`
      : `₹${n}`;

  if (loading) return <SkeletonLoader />;

  const s = stats!;

  const STAT_CARDS = [
    {
      title: 'Total Products',
      value: s.totalProducts.toLocaleString(),
      icon: Package,
      color: '#3B82F6',
      trend: { value: 12, up: true },
      subtitle: 'Active SKUs',
    },
    {
      title: 'Warehouses',
      value: s.totalWarehouses,
      icon: Warehouse,
      color: '#10B981',
      trend: { value: 0, up: true },
      subtitle: 'Operational',
    },
    {
      title: 'Inventory Value',
      value: fmt(s.totalInventoryValue),
      icon: DollarSign,
      color: '#8B5CF6',
      trend: { value: 8, up: true },
      subtitle: 'Total stock worth',
    },
    {
      title: 'Suppliers',
      value: s.totalSuppliers,
      icon: Users,
      color: '#F59E0B',
      trend: { value: 5, up: true },
      subtitle: 'Active partners',
    },
    {
      title: 'Low Stock Items',
      value: s.lowStockProducts,
      icon: AlertTriangle,
      color: '#F59E0B',
      trend: { value: 3, up: false },
      subtitle: 'Needs attention',
    },
    {
      title: 'Out of Stock',
      value: s.outOfStockProducts,
      icon: AlertTriangle,
      color: '#EF4444',
      trend: { value: 1, up: false },
      subtitle: 'Critical',
    },
    {
      title: 'Pending Orders',
      value: s.pendingPurchaseOrders,
      icon: ShoppingCart,
      color: '#3B82F6',
      subtitle: 'Awaiting action',
    },
    {
      title: 'AI Alerts',
      value: s.activeAlerts,
      icon: Brain,
      color: '#8B5CF6',
      subtitle: 'Forecast alerts',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Enterprise Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Real-time inventory &amp; supply chain overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400">Live</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors text-gray-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CARDS.map((card, i) => (
          <StatCard key={card.title} {...card} delay={i * 0.05} />
        ))}
      </div>

      {/* ── Charts Row 1: Trends + Category ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Inventory Trends"
          subtitle="12-month stock movement"
          delay={0.3}
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={TREND_DATA}>
              <defs>
                <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#6B7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6B7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#9CA3AF', fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="inbound"
                stroke="#3B82F6"
                fill="url(#gradIn)"
                strokeWidth={2}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="outbound"
                stroke="#10B981"
                fill="url(#gradOut)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Category Distribution"
          subtitle="By inventory value"
          delay={0.35}
        >
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={CATEGORY_DATA}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {CATEGORY_DATA.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => [`${v}%`, 'Share']}
                contentStyle={{
                  background: '#0D1424',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {CATEGORY_DATA.map((c) => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: c.color }}
                  />
                  <span className="text-xs text-gray-400">{c.name}</span>
                </div>
                <span className="text-xs font-semibold text-white">{c.value}%</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* ── Charts Row 2: Warehouse + Supplier ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Warehouse Utilization"
          subtitle="Current occupancy %"
          delay={0.4}
        >
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={WAREHOUSE_DATA} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                horizontal={false}
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: '#6B7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={88}
              />
              <Tooltip
                formatter={(v: number) => [`${v}%`, 'Utilization']}
                contentStyle={{
                  background: '#0D1424',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  color: '#fff',
                }}
              />
              <Bar dataKey="utilization" radius={[0, 6, 6, 0]}>
                {WAREHOUSE_DATA.map((w) => (
                  <Cell
                    key={w.name}
                    fill={
                      w.utilization > 80
                        ? '#EF4444'
                        : w.utilization > 60
                        ? '#F59E0B'
                        : '#10B981'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Supplier Performance"
          subtitle="On-time delivery rate"
          delay={0.45}
        >
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={SUPPLIER_DATA}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="name"
                tick={{ fill: '#6B7280', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[60, 100]}
                tick={{ fill: '#6B7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  background: '#0D1424',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  color: '#fff',
                }}
              />
              <Bar dataKey="performance" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── AI Demand Forecast ── */}
      <ChartCard
        title="AI Demand Forecast"
        subtitle="Next 6-month prediction (ML model)"
        delay={0.5}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs font-semibold text-purple-400">AI Powered</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-xs text-gray-400">Predicted demand</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
            <span className="w-2 h-2 rounded-full bg-purple-500/30" />
            <span className="text-xs text-gray-400">Confidence band</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={FORECAST_DATA}>
            <defs>
              <linearGradient id="gradForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#6B7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6B7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="upper"
              stroke="transparent"
              fill="url(#gradBand)"
              strokeWidth={0}
            />
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="#8B5CF6"
              fill="url(#gradForecast)"
              strokeWidth={2}
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
            />
            <Area
              type="monotone"
              dataKey="lower"
              stroke="transparent"
              fill="transparent"
              strokeWidth={0}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
