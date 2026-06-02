import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Plus, Search, Edit2, Trash2, X, Loader2, Warehouse,
  BarChart3, ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-react';
import { warehousesApi } from '../api';
import { useAuthStore } from '../store/authStore';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  address: z.string().min(5, 'Address required'),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  country: z.string().min(2, 'Country required'),
  pinCode: z.string().min(4, 'PIN/ZIP required'),
  contactPerson: z.string().min(2, 'Contact person required'),
  contactPhone: z.string().min(10, 'Phone required'),
  contactEmail: z.string().email('Valid email required'),
  capacity: z.coerce.number().int().positive('Capacity required'),
});
type WarehouseForm = z.infer<typeof schema>;

function UtilizationBar({ percent }: { percent: number }) {
  const color = percent > 80 ? '#ef4444' : percent > 60 ? '#f59e0b' : '#22c55e';
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground font-medium">{percent}% utilized</span>
        <span style={{ color }} className="font-bold">{percent > 80 ? 'Critical' : percent > 60 ? 'High' : 'Healthy'}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} className="h-full rounded-full" style={{ backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function WarehousesPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editWH, setEditWH] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['warehouses', page, search],
    queryFn: () => warehousesApi.getAll({ page, limit: 9, search: search || undefined }),
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<WarehouseForm>({ resolver: zodResolver(schema) });

  const createMut = useMutation({
    mutationFn: (d: WarehouseForm) => warehousesApi.create(d),
    onSuccess: () => { toast.success('Warehouse created'); qc.invalidateQueries({ queryKey: ['warehouses'] }); setShowModal(false); reset(); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, d }: any) => warehousesApi.update(id, d),
    onSuccess: () => { toast.success('Warehouse updated'); qc.invalidateQueries({ queryKey: ['warehouses'] }); setShowModal(false); setEditWH(null); reset(); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => warehousesApi.delete(id),
    onSuccess: () => { toast.success('Warehouse removed'); qc.invalidateQueries({ queryKey: ['warehouses'] }); },
  });

  const openEdit = (w: any) => {
    setEditWH(w);
    Object.entries(w).forEach(([k, v]) => setValue(k as any, v as any));
    setShowModal(true);
  };
  const onSubmit = (d: WarehouseForm) => {
    if (editWH) updateMut.mutate({ id: editWH.id, d });
    else createMut.mutate(d);
  };

  const warehouses: any[] = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const totalCapacity = warehouses.reduce((s: number, w: any) => s + (w.capacity || 0), 0);
  const avgUtil = warehouses.length ? Math.round(warehouses.reduce((s: number, w: any) => s + (w.utilizationPercent || 0), 0) / warehouses.length) : 0;

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Warehouse Network</h1>
          <p className="page-subtitle">{total} warehouses · {totalCapacity.toLocaleString()} total capacity</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditWH(null); reset(); setShowModal(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Add Warehouse
          </button>
        )}
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Warehouses', value: total, icon: Warehouse, color: 'bg-blue-100 dark:bg-blue-950/40 text-blue-600' },
          { label: 'Total Capacity', value: totalCapacity.toLocaleString(), icon: BarChart3, color: 'bg-violet-100 dark:bg-violet-950/40 text-violet-600' },
          { label: 'Avg. Utilization', value: `${avgUtil}%`, icon: AlertTriangle, color: avgUtil > 80 ? 'bg-red-100 dark:bg-red-950/40 text-red-600' : 'bg-amber-100 dark:bg-amber-950/40 text-amber-600' },
          { label: 'Active Warehouses', value: warehouses.filter((w: any) => w.isActive).length, icon: Warehouse, color: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}><s.icon className="w-5 h-5" /></div>
            <div className="text-2xl font-black text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search warehouses…" className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-60 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {warehouses.map((w: any) => (
            <motion.div key={w.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-card-hover transition-all" whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-foreground text-base leading-tight">{w.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{w.city}, {w.state}</p>
                </div>
                <span className={`badge-status text-xs ${w.isActive ? 'badge-normal' : 'badge-out'}`}>{w.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="space-y-1 mb-4 text-xs text-muted-foreground">
                <p className="truncate">📍 {w.address}</p>
                <p>👤 {w.contactPerson} · {w.contactPhone}</p>
                <p className="truncate">✉️ {w.contactEmail}</p>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-foreground">{w.currentStockCount?.toLocaleString()} / {w.capacity?.toLocaleString()} units</span>
                </div>
                <UtilizationBar percent={w.utilizationPercent || 0} />
              </div>
              {isAdmin && (
                <div className="flex gap-2 pt-3 border-t border-border">
                  <button onClick={() => openEdit(w)} className="flex-1 py-2 rounded-xl text-xs font-semibold text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-1"><Edit2 className="w-3.5 h-3.5" />Edit</button>
                  <button onClick={() => { if (confirm(`Delete ${w.name}?`)) deleteMut.mutate(w.id); }} className="flex-1 py-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center gap-1"><Trash2 className="w-3.5 h-3.5" />Delete</button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="flex items-center gap-1 px-3 py-2 rounded-xl border border-input text-sm disabled:opacity-40 hover:bg-muted"><ChevronLeft className="w-4 h-4" />Prev</button>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="flex items-center gap-1 px-3 py-2 rounded-xl border border-input text-sm disabled:opacity-40 hover:bg-muted">Next<ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-lg font-bold">{editWH ? 'Edit Warehouse' : 'Add Warehouse'}</h2>
                <button onClick={() => { setShowModal(false); setEditWH(null); reset(); }} className="p-2 rounded-xl hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'name', label: 'Warehouse Name', span: true, placeholder: 'Mumbai Central' },
                    { id: 'address', label: 'Street Address', span: true, placeholder: 'Plot 12, MIDC Industrial Area' },
                    { id: 'city', label: 'City', placeholder: 'Mumbai' },
                    { id: 'state', label: 'State', placeholder: 'Maharashtra' },
                    { id: 'country', label: 'Country', placeholder: 'India' },
                    { id: 'pinCode', label: 'PIN/ZIP Code', placeholder: '400093' },
                    { id: 'contactPerson', label: 'Contact Person', placeholder: 'Rajesh Kumar' },
                    { id: 'contactPhone', label: 'Phone', placeholder: '+91 9876543210' },
                    { id: 'contactEmail', label: 'Email', placeholder: 'mumbai@company.com' },
                    { id: 'capacity', label: 'Capacity (units)', placeholder: '10000' },
                  ].map(f => (
                    <div key={f.id} className={f.span ? 'col-span-2' : ''}>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{f.label}</label>
                      <input {...register(f.id as any)} placeholder={f.placeholder} className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      {(errors as any)[f.id] && <p className="text-xs text-destructive mt-1">{(errors as any)[f.id]?.message}</p>}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); setEditWH(null); reset(); }} className="flex-1 py-2.5 rounded-xl border border-input text-sm font-semibold hover:bg-muted">Cancel</button>
                  <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-60">
                    {(createMut.isPending || updateMut.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editWH ? 'Save Changes' : 'Create Warehouse'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}