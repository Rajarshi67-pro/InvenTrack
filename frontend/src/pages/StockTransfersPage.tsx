import { motion } from 'framer-motion';
import { ArrowLeftRight, Plus, RefreshCw } from 'lucide-react';

interface Transfer {
  id: string;
  from: string;
  to: string;
  product: string;
  qty: number;
  status: string;
  date: string;
}

const MOCK: Transfer[] = [
  {
    id: '1',
    from: 'Main Distribution Hub',
    to: 'East Wing Storage',
    product: 'Industrial Valve XL-500',
    qty: 50,
    status: 'COMPLETED',
    date: '2026-06-01',
  },
  {
    id: '2',
    from: 'West Coast Depot',
    to: 'Main Distribution Hub',
    product: 'Safety Helmet Pro',
    qty: 25,
    status: 'PENDING',
    date: '2026-06-02',
  },
  {
    id: '3',
    from: 'North Regional Centre',
    to: 'West Coast Depot',
    product: 'Electric Motor EM-750W',
    qty: 10,
    status: 'IN_TRANSIT',
    date: '2026-06-03',
  },
];

const statusColor: Record<string, string> = {
  COMPLETED: 'badge-green',
  PENDING: 'badge-amber',
  IN_TRANSIT: 'badge-blue',
  CANCELLED: 'badge-red',
};

export default function StockTransfersPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="page-header">
        <div>
          <h1 className="section-title">Stock Transfers</h1>
          <p className="section-subtitle">Move inventory between warehouses</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" />
          New Transfer
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white">Transfer History</h3>
          </div>
          <button className="text-gray-400 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['From Warehouse', 'To Warehouse', 'Product', 'Qty', 'Status', 'Date'].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {MOCK.map((t) => (
                <tr key={t.id} className="table-row-hover">
                  <td className="px-6 py-4 text-sm text-gray-300">{t.from}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{t.to}</td>
                  <td className="px-6 py-4 text-sm text-white font-medium">{t.product}</td>
                  <td className="px-6 py-4 text-sm text-white font-semibold">{t.qty}</td>
                  <td className="px-6 py-4">
                    <span className={statusColor[t.status] || 'badge-gray'}>{t.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
