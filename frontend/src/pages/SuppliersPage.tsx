import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Plus, Search, Edit2, Trash2, X, Loader2, Star, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { suppliersApi } from '../api';
import { useAuthStore } from '../store/authStore';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const schema = z.object({
  name: z.string().min(2),
  contactPerson: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email(),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  country: z.string().min(2),
  gstNumber: z.string().optional(),
  leadTimeDays: z.coerce.number().int().positive(),
  paymentTerms: z.string().min(2),
});
type SupplierForm = z.infer<typeof schema>;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
      ))}
      <span className="text-xs font-bold text-foreground ml-1">{rating?.toFixed(1)}</span>
    </div>
  );
}

function InitialsAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const colors = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const color = colors[name?.charCodeAt(0) % colors.length];
  const sizeClass = { sm: 'w-8 h-8 text-xs', md: 'w-11 h-11 text-sm', lg: 'w-14 h-14 text-base' }[size];
  return <div className={`${sizeClass} ${color} rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0`}>{initials}</div>;
}

export default function SuppliersPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editSupplier, setEditSupplier] = useState<any>(null);
  const [perfSupplier, setPerfSupplier] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', page, search],
    queryFn: () => suppliersApi.getAll({ page, limit: 9, search: search || undefined }),
  });
  const { data: perf, isLoading: perfLoading } = useQuery({
    queryKey: ['supplier-perf', perfSupplier?.id],
    queryFn: () => suppliersApi.getPerformance(perfSupplier.id),
    enabled: !!perfSupplier,
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SupplierForm>({ resolver: zodResolver(schema) });

  const createMut = useMutation({ mutationFn: suppliersApi.create, onSuccess: () => { toast.success('Supplier added'); qc.invalidateQueries({ queryKey: ['suppliers'] }); setShowModal(false); reset(); } });
  const updateMut = useMutation({ mutationFn: ({ id, d }: any) => suppliersApi.update(id, d), onSuccess: () => { toast.success('Supplier updated'); qc.invalidateQueries({ queryKey: ['suppliers'] }); setShowModal(false); setEditSupplier(null); reset(); } });
  const deleteMut = useMutation({ mutationFn: (id: string) => suppliersApi.delete(id), onSuccess: () => { toast.success('Supplier removed'); qc.invalidateQueries({ queryKey: ['suppliers'] }); } });

  const openEdit = (s: any) => { setEditSupplier(s); Object.entries(s).forEach(([k, v]) => setValue(k as any, v as any)); setShowModal(true); };
  const onSubmit = (d: SupplierForm) => { if (editSupplier) updateMut.mutate({ id: editSupplier.id, d }); else createMut.mutate(d as any); };

  const suppliers: any[] = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const PERF_COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Supplier Directory</h1>
          <p className="page-subtitle">{total} active suppliers</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditSupplier(null); reset(); setShowModal(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Add Supplier
          </button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search suppliers…" className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {suppliers.map(s => (
            <motion.div key={s.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-card-hover transition-all" whileHover={{ y: -3 }}>
              <div className="flex items-start gap-3 mb-4">
                <InitialsAvatar name={s.name} />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-foreground text-sm leading-tight truncate">{s.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.city}, {s.state}</p>
                  <StarRating rating={s.rating} />
                </div>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground mb-4">
                <p>👤 {s.contactPerson}</p>
                <p>📞 {s.phone}</p>
                <p className="truncate">✉️ {s.email}</p>
                {s.gstNumber && <p className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">GST: {s.gstNumber}</p>}
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'Lead Time', value: `${s.leadTimeDays}d` },
                  { label: 'Orders', value: s.totalOrders },
                  { label: 'On-time', value: `${s.deliveryPerformance}%` },
                ].map(m => (
                  <div key={m.label} className="bg-muted/50 rounded-xl p-2 text-center">
                    <div className="font-black text-foreground text-sm">{m.value}</div>
                    <div className="text-xs text-muted-foreground">{m.label}</div>
                  </div>
                ))}
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Delivery Performance</span><span className={`font-bold ${s.deliveryPerformance >= 90 ? 'text-emerald-500' : s.deliveryPerformance >= 70 ? 'text-amber-500' : 'text-red-500'}`}>{s.deliveryPerformance}%</span></div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.deliveryPerformance >= 90 ? 'bg-emerald-500' : s.deliveryPerformance >= 70 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${s.deliveryPerformance}%` }} />
                </div>
              </div>
              {isAdmin && (
                <div className="flex gap-2 pt-3 border-t border-border">
                  <button onClick={() => setPerfSupplier(s)} className="flex-1 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1"><TrendingUp className="w-3 h-3" />Stats</button>
                  <button onClick={() => openEdit(s)} className="flex-1 py-2 rounded-xl text-xs font-semibold text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-1"><Edit2 className="w-3 h-3" />Edit</button>
                  <button onClick={() => { if (confirm(`Delete ${s.name}?`)) deleteMut.mutate(s.id); }} className="flex-1 py-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center gap-1"><Trash2 className="w-3 h-3" />Delete</button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="flex items-center gap-1 px-3 py-2 rounded-xl border border-input text-sm disabled:opacity-40 hover:bg-muted"><ChevronLeft className="w-4 h-4" />Prev</button>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="flex items-center gap-1 px-3 py-2 rounded-xl border border-input text-sm disabled:opacity-40 hover:bg-muted">Next<ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Performance Modal */}
      <AnimatePresence>
        {perfSupplier && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <InitialsAvatar name={perfSupplier.name} size="sm" />
                  <div>
                    <h2 className="font-bold text-foreground">{perfSupplier.name}</h2>
                    <p className="text-xs text-muted-foreground">Performance Analytics</p>
                  </div>
                </div>
                <button onClick={() => setPerfSupplier(null)} className="p-2 rounded-xl hover:bg-muted"><X className="w-5 h-5" /></button>
              </div>
              {perfLoading ? <div className="h-48 skeleton rounded-xl" /> : perf && (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      { label: 'Total Orders', value: perf.totalOrders },
                      { label: 'Delivered', value: perf.deliveredOrders },
                      { label: 'Rating', value: `${perf.rating}/5` },
                      { label: 'On-time Delivery', value: `${perf.deliveryRate}%` },
                    ].map(m => (
                      <div key={m.label} className="bg-muted/40 rounded-xl p-3 text-center">
                        <div className="text-xl font-black text-foreground">{m.value}</div>
                        <div className="text-xs text-muted-foreground">{m.label}</div>
                      </div>
                    ))}
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={[
                        { name: 'Delivered', value: perf.deliveredOrders },
                        { name: 'Pending', value: perf.totalOrders - perf.deliveredOrders },
                      ]} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
                        {['#22c55e', '#f59e0b'].map((c, i) => <Cell key={i} fill={c} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-lg font-bold">{editSupplier ? 'Edit Supplier' : 'Add Supplier'}</h2>
                <button onClick={() => { setShowModal(false); setEditSupplier(null); reset(); }} className="p-2 rounded-xl hover:bg-muted"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'name', label: 'Supplier Name', span: true },
                    { id: 'contactPerson', label: 'Contact Person' },
                    { id: 'phone', label: 'Phone' },
                    { id: 'email', label: 'Email' },
                    { id: 'address', label: 'Address', span: true },
                    { id: 'city', label: 'City' },
                    { id: 'state', label: 'State' },
                    { id: 'country', label: 'Country' },
                    { id: 'gstNumber', label: 'GST Number' },
                    { id: 'leadTimeDays', label: 'Lead Time (days)' },
                    { id: 'paymentTerms', label: 'Payment Terms' },
                  ].map(f => (
                    <div key={f.id} className={f.span ? 'col-span-2' : ''}>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{f.label}</label>
                      <input {...register(f.id as any)} className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      {(errors as any)[f.id] && <p className="text-xs text-destructive mt-1">{(errors as any)[f.id]?.message}</p>}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setShowModal(false); setEditSupplier(null); reset(); }} className="flex-1 py-2.5 rounded-xl border border-input text-sm font-semibold hover:bg-muted">Cancel</button>
                  <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-60">
                    {(createMut.isPending || updateMut.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editSupplier ? 'Save Changes' : 'Add Supplier'}
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