import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, Plus, Search, Package, MapPin, CheckCircle, Clock, Navigation } from 'lucide-react';
import { api } from '../api/client';

const MOCK = [
  { id: 'sh1', shipmentNumber: 'SHP-2026-001', type: 'INBOUND', status: 'IN_TRANSIT', carrier: 'BlueDart', trackingNumber: 'BD123456789', expectedDelivery: '2026-06-10', warehouseId: 'demo-w1', createdAt: '2026-06-03' },
  { id: 'sh2', shipmentNumber: 'SHP-2026-002', type: 'OUTBOUND', status: 'DISPATCHED', carrier: 'Delhivery', trackingNumber: 'DL987654321', expectedDelivery: '2026-06-08', warehouseId: 'demo-w2', createdAt: '2026-06-02' },
  { id: 'sh3', shipmentNumber: 'SHP-2026-003', type: 'INBOUND', status: 'DELIVERED', carrier: 'FedEx', trackingNumber: 'FX111222333', expectedDelivery: '2026-06-01', warehouseId: 'demo-w3', createdAt: '2026-05-28' },
  { id: 'sh4', shipmentNumber: 'SHP-2026-004', type: 'INBOUND', status: 'CREATED', carrier: 'DTDC', trackingNumber: 'DT445566778', expectedDelivery: '2026-06-15', warehouseId: 'demo-w4', createdAt: '2026-06-03' },
];

type Shipment = typeof MOCK[number];

const TIMELINE = ['CREATED','PACKED','DISPATCHED','IN_TRANSIT','DELIVERED'];
const STATUS_CLS: Record<string, string> = {
  CREATED: 'badge-gray', PACKED: 'badge-purple', DISPATCHED: 'badge-blue',
  IN_TRANSIT: 'badge-amber', DELIVERED: 'badge-green'
};

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>(MOCK);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    api.get('/shipments').then(r => { const d = r.data.data?.data || r.data.data; if (Array.isArray(d) && d.length) setShipments(d); }).catch(() => {});
  }, []);

  const filtered = shipments.filter(s =>
    s.shipmentNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.carrier?.toLowerCase().includes(search.toLowerCase())
  );

  const statusStep = (status: string) => TIMELINE.indexOf(status);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="page-header">
        <div>
          <h1 className="section-title">Shipment Tracking</h1>
          <p className="section-subtitle">Monitor inbound and outbound shipments in real-time</p>
        </div>
        <button className="btn-primary"><Plus className="w-4 h-4" />New Shipment</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Shipments', value: shipments.length, color: '#3B82F6' },
          { label: 'In Transit', value: shipments.filter(s=>s.status==='IN_TRANSIT').length, color: '#F59E0B' },
          { label: 'Delivered', value: shipments.filter(s=>s.status==='DELIVERED').length, color: '#10B981' },
          { label: 'Pending', value: shipments.filter(s=>['CREATED','PACKED'].includes(s.status)).length, color: '#8B5CF6' },
        ].map((s,i) => (
          <motion.div key={s.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i*0.06 }} className="glass-card p-4">
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input className="input-field pl-10" placeholder="Search shipments..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="space-y-3">
        {filtered.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.05 }}
            className="glass-card p-5 cursor-pointer hover:border-white/[0.15] transition-all duration-200"
            onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.type === 'INBOUND' ? 'bg-blue-500/10' : 'bg-emerald-500/10'}`}>
                  {s.type === 'INBOUND' ? <Package className="w-5 h-5 text-blue-400" /> : <Truck className="w-5 h-5 text-emerald-400" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{s.shipmentNumber}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.type === 'INBOUND' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{s.type}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.carrier} · {s.trackingNumber}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-gray-500">Expected</div>
                  <div className="text-sm font-medium text-white">{s.expectedDelivery}</div>
                </div>
                <span className={STATUS_CLS[s.status] || 'badge-gray'}>{s.status.replace('_',' ')}</span>
              </div>
            </div>

            {/* Timeline */}
            {expanded === s.id && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-5 pt-5 border-t border-white/[0.06]">
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/[0.06]" />
                  <div className="absolute top-4 left-0 h-0.5 bg-blue-500 transition-all duration-700" style={{ width: `${(statusStep(s.status) / (TIMELINE.length-1)) * 100}%` }} />
                  {TIMELINE.map((step, idx) => {
                    const done = idx <= statusStep(s.status);
                    return (
                      <div key={step} className="flex flex-col items-center gap-2 z-10">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          done ? 'bg-blue-600 border-blue-500' : 'bg-[#0D1424] border-white/10'
                        }`}>
                          {done ? <CheckCircle className="w-4 h-4 text-white" /> : <Clock className="w-4 h-4 text-gray-600" />}
                        </div>
                        <span className={`text-[10px] font-medium ${done ? 'text-blue-400' : 'text-gray-600'}`}>{step.replace('_',' ')}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
