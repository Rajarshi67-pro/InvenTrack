import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, Shield, Briefcase, Search, MoreVertical } from 'lucide-react';
import { api } from '../api/client';

const MOCK = [
  { id: 'demo-admin-id', fullName: 'Demo Admin', email: 'admin@inventrack.com', role: 'ADMIN', isActive: 1, createdAt: '2026-01-01' },
  { id: 'demo-manager-id', fullName: 'Demo Manager', email: 'manager@inventrack.com', role: 'MANAGER', isActive: 1, createdAt: '2026-01-15' },
];

type User = typeof MOCK[number];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(MOCK);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/users').then(r => { const d = r.data.data?.data || r.data.data; if (Array.isArray(d) && d.length) setUsers(d); }).catch(() => {});
  }, []);

  const filtered = users.filter(u => u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="page-header">
        <div>
          <h1 className="section-title">User Management</h1>
          <p className="section-subtitle">Manage system users, roles, and access permissions</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: '#3B82F6' },
          { label: 'Admins', value: users.filter(u=>u.role==='ADMIN').length, icon: Shield, color: '#8B5CF6' },
          { label: 'Managers', value: users.filter(u=>u.role==='MANAGER').length, icon: Briefcase, color: '#10B981' },
        ].map((s,i) => (
          <motion.div key={s.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i*0.07 }} className="glass-card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input className="input-field pl-10" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['User','Email','Role','Status','Joined','Actions'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.map((u, i) => (
              <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i*0.05 }} className="table-row-hover">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                      {u.fullName.charAt(0)}
                    </div>
                    <span className="font-medium text-white text-sm">{u.fullName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={u.role === 'ADMIN' ? 'badge-purple' : 'badge-blue'}>
                    {u.role === 'ADMIN' ? <Shield className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={u.isActive ? 'badge-green' : 'badge-red'}>{u.isActive ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{u.createdAt}</td>
                <td className="px-6 py-4">
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}