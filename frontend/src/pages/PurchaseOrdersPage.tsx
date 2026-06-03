import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Search, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { api } from '../api/client';

const MOCK = [
  { id: 'po1', poNumber: 'PO-2026-001', supplierName: 'TechCorp Industries', status: 'APPROVED', totalAmount: 15499.50, expectedDelivery: '2026-06-15', createdAt: '2026-06-01' },
  { id: 'po2', poNumber: 'PO-2026-002', supplierName: 'Global Supply Chain Ltd', status: 'ORDERED', totalAmount: 8220.00, expectedDelivery: '2026-06-20', createdAt: '2026-05-28' },
  { id: 'po3', poNumber: 'PO-2026-003', supplierName: 'FastLogistics Co.', status: 'DRAFT', totalAmount: 3360.00, expectedDelivery: '2026-06-25', createdAt: '2026-06-03' },
  { id: 'po4', poNumber: 'PO-2026-004', supplierName: 'Allied Manufacturing', status: 'RECEIVED', totalAmount: 22100.00, expectedDelivery: '2026-05-30', createdAt: '2026-05-20' },
  { id: 'po5', poNumber: 'PO-2026-005', supplierName: 'Rapid Parts Pvt Ltd', status: 'CANCELLED', totalAmount: 5500.00, expectedDelivery: '2026-06-18', createdAt: '2026-06-02' },
];

type PO = typeof MOCK[number];

const STATUS_CONFIG: Record<string, { cls: string; icon: React.ElementType }> = {
  DRAFT: { cls: 'badge-gray', icon: Clock },
  APPROVED: { cls: 'badge-blue', icon: CheckCircle },
  ORDERED: { cls: 'badge-purple', icon: ShoppingCart },
  RECEIVED: { cls: 'badge-green', icon: CheckCircle },
  CANCELLED: { cls: 'badge-red', icon: XCircle },
};

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PO[]>(MOCK);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    api.get('/purchase-orders').then(r => { const d = r.data.data?.data || r.data.data; if (Array.isArray(d) && d.length) setOrders(d); }).catch(() => {});
  }, []);

  const filtered = orders.filter(o =>
    (filterStatus === 'ALL' || o.status === filterStatus) &&
    (o.poNumber.toLowerCase().includes(search.toLowerCase()) || o.supplierName?.toLowerCase().includes(search.toLowerCase()))
  );

  const total = orders.reduce((s, o) => s + o.totalAmount, 0);
  const pending = orders.filter(o => ['DRAFT','APPROVED','ORDERED'].includes(o.status)).length;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="page-header">
        <div>
          <h1 className="section-title">Purchase Orders</h1>
          <p className="section-subtitle">Manage the complete procurement workflow</p>
        </div>
        <button className="btn-primary"><Plus className="w-4 h-4" />Create PO</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total POs', value: orders.length, color: '#3B82F6' },
          { label: 'Pending Action', value: pending, color: '#F59E0B' },
          { label: 'Received', value: orders.filter(o=>o.status==='RECEIVED').length, color: '#10B981' },
          { label: 'Total Value', value: `₹${(total/1000).toFixed(0)}K`, color: '#8B5CF6' },
        ].map((s,i) => (
          <motion.div key={s.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i*0.06 }} className="glass-card p-4">
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input className="input-field pl-10" placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['ALL','DRAFT','APPROVED','ORDERED','RECEIVED','CANCELLED'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                filterStatus === s ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['PO Number','Supplier','Status','Total Amount','Expected Delivery','Created','Actions'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((po, i) => {
                const config = STATUS_CONFIG[po.status] || { cls: 'badge-gray', icon: Clock };
                return (
                  <motion.tr key={po.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i*0.04 }} className="table-row-hover">
                    <td className="px-6 py-4 font-mono text-sm font-semibold text-blue-400">{po.poNumber}</td>
                    <td className="px-6 py-4 text-sm text-white">{po.supplierName}</td>
                    <td className="px-6 py-4"><span className={config.cls}>{po.status}</span></td>
                    <td className="px-6 py-4 text-sm font-bold text-white">₹{po.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{po.expectedDelivery}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{po.createdAt}</td>
                    <td className="px-6 py-4">
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}