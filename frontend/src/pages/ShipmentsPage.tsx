import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package, PackageCheck, Truck, PackageOpen, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { purchaseOrdersApi } from '../api';

const STEPS = ['Created', 'Packed', 'In Transit', 'Delivered'];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-1">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
            i < currentStep ? 'bg-primary' : i === currentStep ? 'border-2 border-primary' : 'bg-muted border border-border'
          }`}>
            {i < currentStep ? <CheckCircle className="w-3 h-3 text-white" /> :
              i === currentStep ? <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> : null}
          </div>
          {i < STEPS.length - 1 && <div className={`w-4 h-0.5 ${i < currentStep ? 'bg-primary' : 'bg-border'}`} />}
        </div>
      ))}
    </div>
  );
}

function statusToStep(status: string): number {
  const map: Record<string, number> = { DRAFT: 0, APPROVED: 1, ORDERED: 2, DELIVERED: 3, CANCELLED: 0 };
  return map[status] ?? 0;
}

export default function ShipmentsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['shipments-pos'],
    queryFn: () => purchaseOrdersApi.getAll({ limit: 50 }),
  });

  const updateStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => purchaseOrdersApi.updateStatus(id, status),
    onSuccess: () => { toast.success('Shipment status updated'); qc.invalidateQueries({ queryKey: ['shipments-pos'] }); qc.invalidateQueries({ queryKey: ['products'] }); },
  });

  const pos: any[] = data?.data || [];
  const statusCounts = {
    Created: pos.filter(p => p.status === 'DRAFT' || p.status === 'APPROVED').length,
    Packed: pos.filter(p => p.status === 'APPROVED').length,
    'In Transit': pos.filter(p => p.status === 'ORDERED').length,
    Delivered: pos.filter(p => p.status === 'DELIVERED').length,
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Shipment Tracking</h1>
          <p className="page-subtitle">Monitor all incoming and outgoing shipments</p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Created', count: statusCounts.Created, icon: Package, color: 'bg-slate-100 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400' },
          { label: 'Packed', count: statusCounts.Packed, icon: PackageCheck, color: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600' },
          { label: 'In Transit', count: statusCounts['In Transit'], icon: Truck, color: 'bg-blue-100 dark:bg-blue-950/40 text-blue-600', pulse: true },
          { label: 'Delivered', count: statusCounts.Delivered, icon: PackageOpen, color: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600' },
        ].map(({ label, count, icon: Icon, color, pulse }) => (
          <motion.div key={label} className="stat-card" whileHover={{ y: -3 }}>
            <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-3 ${pulse ? 'animate-pulse-glow' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black text-foreground">{count}</div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Shipments Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-bold text-foreground">All Shipments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Shipment ID</th><th>Supplier</th><th>Destination</th><th>Expected</th><th>Progress</th><th>Actions</th></tr></thead>
            <tbody>
              {isLoading ? [...Array(5)].map((_, i) => <tr key={i}><td colSpan={6}><div className="h-12 skeleton rounded my-1" /></td></tr>) :
                pos.map(po => (
                  <tr key={po.id}>
                    <td><span className="font-mono font-bold text-sm text-primary">{po.poNumber}</span></td>
                    <td className="font-medium text-sm text-foreground">{po.supplier?.name}</td>
                    <td className="text-sm text-muted-foreground">{po.warehouse?.name}</td>
                    <td className="text-sm text-muted-foreground">{po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td>
                      <div className="space-y-1">
                        <StepIndicator currentStep={statusToStep(po.status)} />
                        <span className="text-xs text-muted-foreground">{STEPS[statusToStep(po.status)]}</span>
                      </div>
                    </td>
                    <td>
                      {po.status === 'ORDERED' && (
                        <button onClick={() => updateStatusMut.mutate({ id: po.id, status: 'DELIVERED' })} disabled={updateStatusMut.isPending} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors disabled:opacity-50">
                          {updateStatusMut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                          Mark Delivered
                        </button>
                      )}
                      {(po.status === 'DELIVERED' || po.status === 'CANCELLED') && (
                        <span className={`text-xs font-semibold ${po.status === 'DELIVERED' ? 'text-emerald-500' : 'text-red-500'}`}>{po.status === 'DELIVERED' ? '✓ Completed' : '✗ Cancelled'}</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-bold text-foreground">Live Shipment Map</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Connect to a mapping API for live tracking</p>
        </div>
        <div className="relative h-56 bg-slate-950 overflow-hidden">
          {/* Dot grid pattern */}
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #1e3a5f 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          {/* Location pins */}
          {[
            { label: 'Mumbai', x: '20%', y: '55%', active: true },
            { label: 'Delhi', x: '40%', y: '25%' },
            { label: 'Bangalore', x: '35%', y: '70%' },
            { label: 'Hyderabad', x: '42%', y: '58%' },
          ].map(loc => (
            <div key={loc.label} className="absolute" style={{ left: loc.x, top: loc.y }}>
              <div className={`w-3 h-3 rounded-full border-2 ${loc.active ? 'bg-blue-400 border-blue-200 animate-ping' : 'bg-emerald-400 border-emerald-200'}`} />
              <span className="absolute left-4 top-0 text-xs text-white font-semibold whitespace-nowrap">{loc.label}</span>
            </div>
          ))}
          <div className="absolute inset-0 flex items-end justify-center p-4">
            <p className="text-slate-500 text-xs">Integration with Google Maps / Mapbox required for live tracking</p>
          </div>
        </div>
      </div>
    </div>
  );
}
