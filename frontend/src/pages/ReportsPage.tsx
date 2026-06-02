import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Download, Package, Truck, Warehouse, ShoppingCart, FileText } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { reportsApi, productsApi, dashboardApi } from '../api';

const REPORT_TYPES = [
  { type: 'INVENTORY', icon: Package, label: 'Inventory Report', desc: 'Products, quantities, valuations, stock status', color: 'from-blue-600/20 to-blue-700/10 border-blue-700/30 hover:border-blue-500/50' },
  { type: 'SUPPLIER', icon: Truck, label: 'Supplier Report', desc: 'Performance, ratings, delivery metrics, orders', color: 'from-amber-600/20 to-amber-700/10 border-amber-700/30 hover:border-amber-500/50' },
  { type: 'WAREHOUSE', icon: Warehouse, label: 'Warehouse Report', desc: 'Capacity, utilization, stock distribution', color: 'from-violet-600/20 to-violet-700/10 border-violet-700/30 hover:border-violet-500/50' },
  { type: 'PURCHASE', icon: ShoppingCart, label: 'Purchase Order Report', desc: 'All POs, statuses, amounts, deliveries', color: 'from-emerald-600/20 to-emerald-700/10 border-emerald-700/30 hover:border-emerald-500/50' },
];

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#06b6d4', '#f43f5e', '#a3e635'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-xl p-3 text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => <p key={p.name} style={{ color: p.color }} className="text-xs">{p.name}: <span className="font-bold">{p.value}</span></p>)}
    </div>
  );
};

export default function ReportsPage() {
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [format] = useState('CSV');

  const { data: products } = useQuery({ queryKey: ['products-all-report'], queryFn: () => productsApi.getAll({ limit: 200 }) });
  const { data: warehouseUtil } = useQuery({ queryKey: ['warehouse-utilization'], queryFn: dashboardApi.getWarehouseUtilization });

  const productList: any[] = products?.data || [];

  // Category distribution for pie
  const categoryMap: Record<string, number> = {};
  productList.forEach(p => {
    categoryMap[p.category] = (categoryMap[p.category] || 0) + (p.inventoryValue || 0);
  });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  // Stock status distribution
  const statusMap: Record<string, number> = { NORMAL: 0, LOW_STOCK: 0, OUT_OF_STOCK: 0, OVERSTOCK: 0 };
  productList.forEach(p => { if (statusMap[p.stockStatus] !== undefined) statusMap[p.stockStatus]++; });
  const statusData = Object.entries(statusMap).map(([name, value]) => ({ name: name.replace('_', ' '), value, fill: name === 'NORMAL' ? '#22c55e' : name === 'LOW_STOCK' ? '#f59e0b' : name === 'OUT_OF_STOCK' ? '#ef4444' : '#8b5cf6' }));

  const downloadReport = async (type: string) => {
    setLoadingType(type);
    try {
      const blob = await reportsApi.generate(type, { format });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventrack-${type.toLowerCase()}-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${type} report downloaded successfully`);
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics & Reports</h1>
          <p className="page-subtitle">Generate, filter, and export business intelligence reports</p>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {REPORT_TYPES.map(({ type, icon: Icon, label, desc, color }) => (
          <motion.div key={type} className={`bg-gradient-to-br ${color} border rounded-2xl p-5 cursor-pointer transition-all`} whileHover={{ y: -3, scale: 1.02 }}>
            <div className="mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-foreground text-sm">{label}</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
            </div>
            <button onClick={() => downloadReport(type)} disabled={loadingType === type} className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-semibold text-foreground transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {loadingType === type ? (
                <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Generating…</>
              ) : (
                <><Download className="w-4 h-4" />Export CSV</>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Analytics Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Value by Category */}
        <motion.div className="bg-card border border-border rounded-2xl" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="px-6 py-4 border-b border-border"><h3 className="font-bold text-foreground">Inventory Value by Category</h3></div>
          <div className="p-4">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px' }} formatter={(v: number) => [`₹${(v / 1000).toFixed(0)}K`, 'Value']} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-52 skeleton rounded-xl" />}
          </div>
        </motion.div>

        {/* Stock Status Distribution */}
        <motion.div className="bg-card border border-border rounded-2xl" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="px-6 py-4 border-b border-border"><h3 className="font-bold text-foreground">Stock Status Distribution</h3></div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Products" radius={[6, 6, 0, 0]}>
                  {statusData.map((s, i) => <Cell key={i} fill={s.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Analytics Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Warehouse Utilization */}
        <motion.div className="bg-card border border-border rounded-2xl" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="px-6 py-4 border-b border-border"><h3 className="font-bold text-foreground">Warehouse Utilization Comparison</h3></div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={warehouseUtil?.warehouses || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `${v}%`} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip content={<CustomTooltip />} formatter={(v: number) => [`${v}%`, 'Utilization']} />
                <Bar dataKey="utilization" name="Utilization %" radius={[0, 6, 6, 0]}>
                  {(warehouseUtil?.warehouses || []).map((w: any, i: number) => <Cell key={i} fill={w.fill || '#3b82f6'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Products by Value */}
        <motion.div className="bg-card border border-border rounded-2xl" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="px-6 py-4 border-b border-border"><h3 className="font-bold text-foreground">Top 5 Products by Inventory Value</h3></div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={productList.sort((a, b) => (b.inventoryValue || 0) - (a.inventoryValue || 0)).slice(0, 5).map(p => ({ name: p.name.split(' ').slice(0, 2).join(' '), value: p.inventoryValue || 0 }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `₹${(v / 100000).toFixed(1)}L`} />
                <YAxis dataKey="name" type="category" width={85} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip content={<CustomTooltip />} formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Value']} />
                <Bar dataKey="value" name="Inventory Value" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}