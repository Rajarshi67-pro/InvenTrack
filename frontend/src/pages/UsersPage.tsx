import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Plus, Search, Edit2, ToggleLeft, ToggleRight, X, Loader2, ShieldCheck, Briefcase, User } from 'lucide-react';
import { usersApi, warehousesApi } from '../api';
import { useAuthStore } from '../store/authStore';

const schema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  email: z.string().email('Valid email required'),
  password: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER']),
  phone: z.string().optional(),
  warehouseId: z.string().optional(),
});
type UserForm = z.infer<typeof schema>;

function RoleBadge({ role }: { role: string }) {
  return role === 'ADMIN' ?
    <span className="flex items-center gap-1.5 badge-approved text-xs"><ShieldCheck className="w-3 h-3" />Admin</span> :
    <span className="flex items-center gap-1.5 badge-low text-xs"><Briefcase className="w-3 h-3" />Manager</span>;
}

function InitialsAvatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const colors = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500'];
  const initials = (name || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const color = colors[(name || '').charCodeAt(0) % colors.length];
  const cls = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm' }[size];
  return <div className={`${cls} ${color} rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0`}>{initials}</div>;
}

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search],
    queryFn: () => usersApi.getAll({ page, limit: 15, search: search || undefined }),
  });
  const { data: warehouses } = useQuery({ queryKey: ['warehouses-all'], queryFn: () => warehousesApi.getAll({ limit: 100 }) });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<UserForm>({ resolver: zodResolver(schema), defaultValues: { role: 'MANAGER' } });
  const roleWatch = watch('role');

  const createMut = useMutation({ mutationFn: (d: UserForm) => usersApi.create(d as any), onSuccess: () => { toast.success('User created'); qc.invalidateQueries({ queryKey: ['users'] }); setShowModal(false); reset(); } });
  const updateMut = useMutation({ mutationFn: ({ id, d }: any) => usersApi.update(id, d), onSuccess: () => { toast.success('User updated'); qc.invalidateQueries({ queryKey: ['users'] }); setShowModal(false); setEditUser(null); reset(); } });
  const toggleMut = useMutation({ mutationFn: (id: string) => usersApi.toggleActive(id), onSuccess: () => { toast.success('User status updated'); qc.invalidateQueries({ queryKey: ['users'] }); } });

  const openEdit = (u: any) => {
    setEditUser(u);
    setValue('fullName', u.fullName);
    setValue('email', u.email);
    setValue('role', u.role);
    setValue('phone', u.phone);
    setValue('warehouseId', u.warehouseId || '');
    setShowModal(true);
  };
  const onSubmit = (d: UserForm) => {
    const payload = editUser ? d : { ...d, password: (d as any).password || 'Manager@123' };
    if (editUser) updateMut.mutate({ id: editUser.id, d: payload });
    else createMut.mutate(payload as any);
  };

  const users: any[] = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{total} users registered</p>
        </div>
        <button onClick={() => { setEditUser(null); reset(); setShowModal(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />Add User
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or email…" className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Warehouse</th><th>Last Login</th><th>Actions</th></tr></thead>
            <tbody>
              {isLoading ? [...Array(6)].map((_, i) => <tr key={i}><td colSpan={7}><div className="h-12 skeleton rounded my-1" /></td></tr>) :
                users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <InitialsAvatar name={u.fullName} />
                        <div>
                          <div className="font-semibold text-sm text-foreground">{u.fullName}</div>
                          <div className="text-xs text-muted-foreground">{u.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-muted-foreground">{u.email}</td>
                    <td><RoleBadge role={u.role} /></td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                        <span className={`text-xs font-semibold ${u.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </td>
                    <td className="text-sm text-muted-foreground">{u.warehouse?.name || '—'}</td>
                    <td className="text-xs text-muted-foreground">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN') : 'Never'}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button
                          onClick={() => { if (u.id === currentUser?.id) { toast.error('Cannot deactivate yourself'); return; } if (confirm(`${u.isActive ? 'Deactivate' : 'Activate'} ${u.fullName}?`)) toggleMut.mutate(u.id); }}
                          disabled={u.id === currentUser?.id}
                          title={u.id === currentUser?.id ? 'Cannot change your own status' : ''}
                          className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 ${u.isActive ? 'text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10' : 'text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10'}`}
                        >
                          {u.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-2 rounded-xl border border-input text-sm disabled:opacity-40 hover:bg-muted">← Prev</button>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-2 rounded-xl border border-input text-sm disabled:opacity-40 hover:bg-muted">Next →</button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-lg font-bold">{editUser ? 'Edit User' : 'Add New User'}</h2>
                <button onClick={() => { setShowModal(false); setEditUser(null); reset(); }} className="p-2 rounded-xl hover:bg-muted"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Full Name *</label>
                    <input {...register('fullName')} className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Email *</label>
                    <input {...register('email')} type="email" className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Phone</label>
                    <input {...register('phone')} className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  {!editUser && (
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Password *</label>
                      <input {...register('password')} type="password" placeholder="min 8 chars, uppercase, number" className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Role *</label>
                    <div className="flex gap-2">
                      {(['ADMIN', 'MANAGER'] as const).map(r => (
                        <button key={r} type="button" onClick={() => setValue('role', r)} className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${roleWatch === r ? 'bg-primary text-primary-foreground border-primary' : 'border-input hover:bg-muted'}`}>
                          {r === 'ADMIN' ? <><ShieldCheck className="w-3.5 h-3.5 inline mr-1" />Admin</> : <><Briefcase className="w-3.5 h-3.5 inline mr-1" />Manager</>}
                        </button>
                      ))}
                    </div>
                  </div>
                  {roleWatch === 'MANAGER' && (
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Assigned Warehouse</label>
                      <select {...register('warehouseId')} className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="">No assignment</option>
                        {(warehouses?.data || []).map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setShowModal(false); setEditUser(null); reset(); }} className="flex-1 py-2.5 rounded-xl border border-input text-sm font-semibold hover:bg-muted">Cancel</button>
                  <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-60">
                    {(createMut.isPending || updateMut.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editUser ? 'Save Changes' : 'Create User'}
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