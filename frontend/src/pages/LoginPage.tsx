import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '../api';
import { useAuthStore } from '../store/authStore';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

const DEMO_CREDS = [
  { role: 'Administrator', email: 'admin@inventrack.com', password: 'Admin@123', icon: ShieldCheck, color: 'from-blue-600 to-blue-700' },
  { role: 'Manager', email: 'manager@inventrack.com', password: 'Manager@123', icon: Briefcase, color: 'from-violet-600 to-violet-700' },
];

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: Math.random() * 120 + 40,
  x: Math.random() * 100,
  y: Math.random() * 100,
  delay: Math.random() * 5,
  duration: Math.random() * 10 + 12,
}));

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'Administrator' | 'Manager'>('Administrator');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const result = await authApi.login(data as any);
      setAuth(result.user, result.tokens.accessToken, result.tokens.refreshToken);
      toast.success(`Welcome back, ${result.user.fullName.split(' ')[0]}! 🎉`);
      navigate('/dashboard');
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const fillCreds = (email: string, password: string, role: string) => {
    setValue('email', email);
    setValue('password', password);
    setSelectedRole(role as any);
  };

  return (
    <div className="min-h-screen bg-[#060814] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background particles */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-blue-500/5 border border-blue-500/10"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
          animate={{ y: [0, -30, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      {/* Background gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-transparent to-red-950/10 pointer-events-none" />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Glass Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <motion.div className="flex items-center gap-3 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-white tracking-tight">InvenTrack Pro</div>
              <div className="text-xs text-slate-400 font-medium">Enterprise IMS · Oracle APEX</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <h1 className="text-2xl font-bold text-white mb-1">Sign in to your account</h1>
            <p className="text-slate-400 text-sm mb-6">Access your enterprise inventory system</p>
          </motion.div>

          {/* Role selector */}
          <motion.div className="flex gap-2 mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            {DEMO_CREDS.map(({ role, icon: Icon, color }) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  selectedRole === role
                    ? `bg-gradient-to-r ${color} text-white shadow-lg`
                    : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {role}
              </button>
            ))}
          </motion.div>

          <motion.form onSubmit={handleSubmit(onSubmit)} className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="admin@inventrack.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input {...register('rememberMe')} type="checkbox" id="remember" className="w-4 h-4 rounded border-white/20 bg-white/5 accent-blue-500" />
              <label htmlFor="remember" className="text-sm text-slate-400">Remember me for 7 days</label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (<><Loader2 className="w-4 h-4 animate-spin" />Authenticating…</>) : 'Sign In to Dashboard'}
            </button>
          </motion.form>

          {/* Demo credentials */}
          <motion.div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Access — Demo Credentials</p>
            <div className="space-y-2">
              {DEMO_CREDS.map(({ role, email, password, icon: Icon, color }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => fillCreds(email, password, role)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors text-left group"
                >
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-300">{role}</div>
                    <div className="text-xs text-slate-500 truncate">{email}</div>
                  </div>
                  <span className="text-xs text-slate-600 group-hover:text-slate-400 transition-colors">Click to fill ↗</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        <p className="text-center text-slate-700 text-xs mt-6">
          © {new Date().getFullYear()} InvenTrack Pro · Enterprise Inventory Management · Oracle APEX
        </p>
      </motion.div>
    </div>
  );
}
