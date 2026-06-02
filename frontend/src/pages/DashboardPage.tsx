import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useDashboardStats, useInventoryTrends, useSupplierPerformance, useWarehouseUtilization } from "../hooks";
import { Building2, Package, Truck, DollarSign, AlertTriangle, ShoppingCart, TrendingUp, Activity } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar, AreaChart, Area } from "recharts";
import { clsx } from "clsx";

function KPICard({ label, value, icon: Icon, color, borderGlow, change, changeUp }: { label: string; value: string | number; icon: React.ElementType; color: string; borderGlow: string; change?: string; changeUp?: boolean }) {
  return (
    <div className={clsx("kpi-card hover:scale-[1.02] transform transition-all duration-300", borderGlow)}>
      <div className={clsx("kpi-icon border-0", color)}><Icon className="w-5 h-5" /></div>
      <div>
        <div className="kpi-value">{value}</div>
        <div className="kpi-label">{label}</div>
        {change && <div className={clsx("kpi-change mt-1", changeUp ? "kpi-up" : "kpi-down")}>{changeUp ? "↑" : "↓"} {change}</div>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useSelector((s: RootState) => s.auth);
  const { data: stats, isLoading } = useDashboardStats();
  const { data: trends } = useInventoryTrends();
  const { data: supplierData } = useSupplierPerformance();
  const { data: warehouseData } = useWarehouseUtilization();

  const kpis = [
    { label: "Total Warehouses", value: stats?.totalWarehouses ?? "—", icon: Building2, color: "bg-primary-500/10 text-primary-400 border border-primary-500/20", borderGlow: "hover:border-primary-500/35 hover:shadow-[0_0_30px_rgba(59,130,246,0.08)]", change: "+2 this month", changeUp: true },
    { label: "Total Products", value: stats?.totalProducts ?? "—", icon: Package, color: "bg-violet-500/10 text-violet-400 border border-violet-500/20", borderGlow: "hover:border-violet-500/35 hover:shadow-[0_0_30px_rgba(139,92,246,0.08)]", change: "+18 this week", changeUp: true },
    { label: "Total Suppliers", value: stats?.totalSuppliers ?? "—", icon: Truck, color: "bg-amber-500/10 text-amber-400 border border-amber-500/20", borderGlow: "hover:border-amber-500/35 hover:shadow-[0_0_30px_rgba(245,158,11,0.08)]" },
    { label: "Inventory Value", value: stats?.totalInventoryValue ? `₹${(stats.totalInventoryValue / 100000).toFixed(1)}L` : "—", icon: DollarSign, color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", borderGlow: "hover:border-emerald-500/35 hover:shadow-[0_0_30px_rgba(16,185,129,0.08)]", change: "+12.4% vs last month", changeUp: true },
    { label: "Low Stock Items", value: stats?.lowStockProducts ?? "—", icon: AlertTriangle, color: "bg-danger-500/10 text-danger-400 border border-danger-500/20", borderGlow: "hover:border-danger-500/35 hover:shadow-[0_0_30px_rgba(239,68,68,0.08)]", change: "Needs attention", changeUp: false },
    { label: "Out of Stock", value: stats?.outOfStockProducts ?? "—", icon: Activity, color: "bg-rose-500/10 text-rose-400 border border-rose-500/20", borderGlow: "hover:border-rose-500/35 hover:shadow-[0_0_30px_rgba(244,63,94,0.08)]" },
    { label: "Pending POs", value: stats?.pendingPurchaseOrders ?? "—", icon: ShoppingCart, color: "bg-sky-500/10 text-sky-400 border border-sky-500/20", borderGlow: "hover:border-sky-500/35 hover:shadow-[0_0_30px_rgba(14,165,233,0.08)]" },
    { label: "Active Alerts", value: stats?.activeAlerts ?? "—", icon: TrendingUp, color: "bg-pink-500/10 text-pink-400 border border-pink-500/20", borderGlow: "hover:border-pink-500/35 hover:shadow-[0_0_30px_rgba(236,72,153,0.08)]" },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">System Overview, {user?.fullName?.split(" ")[0]} 🚀</h1>
          <p className="page-subtitle">{user?.role === "ADMIN" ? "Enterprise Administrator" : "Warehouse & Logistics Manager"} · {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
      </div>

      {/* KPI Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          {kpis.map((kpi) => <KPICard key={kpi.label} {...kpi} />)}
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Trends */}
        <div className="card lg:col-span-2">
          <div className="card-header">
            <span className="font-extrabold text-sm text-slate-300 uppercase tracking-wider">Inventory Value Trends</span>
            <span className="badge badge-blue">Last 12 months</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trends?.monthly || []}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b1329', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                  formatter={(v: number) => [`₹${v.toLocaleString()}`, "Value"]} 
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#colorValue)" strokeWidth={2.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Warehouse Utilization */}
        <div className="card">
          <div className="card-header">
            <span className="font-extrabold text-sm text-slate-300 uppercase tracking-wider">Warehouse Capacity</span>
          </div>
          <div className="card-body flex items-center justify-center">
            <ResponsiveContainer width="100%" height={240}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={warehouseData?.warehouses || []} startAngle={90} endAngle={-270}>
                <RadialBar background={{ fill: '#0f172a' }} dataKey="utilization" fill="#3b82f6" />
                <Legend iconSize={8} layout="vertical" verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b1329', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                  formatter={(v: number) => [`${v}%`, "Utilization"]} 
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Demand */}
        <div className="card">
          <div className="card-header">
            <span className="font-extrabold text-sm text-slate-300 uppercase tracking-wider">Monthly Stock Movement</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trends?.movements || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0b1329', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Bar dataKey="in" name="Stock In" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="out" name="Stock Out" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Supplier Performance */}
        <div className="card">
          <div className="card-header">
            <span className="font-extrabold text-sm text-slate-300 uppercase tracking-wider">Supplier Performance rating</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={supplierData?.suppliers || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} width={90} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b1329', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                  formatter={(v: number) => [`${v}%`, "On-time Delivery"]} 
                />
                <Bar dataKey="performance" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Oracle Analytics Insights (Admin) */}
      {user?.role === "ADMIN" && (
        <div className="card border-l-4 border-l-primary-500 shadow-[0_0_30px_rgba(59,130,246,0.06)]">
          <div className="card-header">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-600/20 border border-primary-500/30 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-primary-400" /></div>
              <span className="font-extrabold text-sm text-slate-300 uppercase tracking-wider">Oracle Analytics Predictive Insights</span>
              <span className="badge badge-blue">AI Powered</span>
            </div>
          </div>
          <div className="card-body grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Stock Prediction Score", value: "87/100", color: "text-emerald-400" },
              { label: "Shortage Risk Alerts", value: "3 Products", color: "text-amber-400" },
              { label: "Optimal Reorder Suggestions", value: "12 Items", color: "text-primary-400" },
              { label: "Procurement Efficiency Gain", value: "+18.4%", color: "text-emerald-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-4 bg-slate-950/40 border border-slate-900 rounded-2xl text-center">
                <div className={`text-2xl font-black ${color}`}>{value}</div>
                <div className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}