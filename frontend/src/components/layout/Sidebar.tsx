import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Warehouse,
  Package,
  BarChart3,
  Truck,
  ShoppingCart,
  Ship,
  TrendingUp,
  FileText,
  Bell,
  Users,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  LogOut,
  BoxesIcon,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { authApi } from '../../api';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  badge?: number;
}

// ─── Navigation definitions ───────────────────────────────────────────────────

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard',       path: '/dashboard',       icon: LayoutDashboard },
  { label: 'Warehouses',      path: '/warehouses',      icon: Warehouse },
  { label: 'Products',        path: '/products',        icon: Package },
  { label: 'Inventory',       path: '/inventory',       icon: BarChart3 },
  { label: 'Suppliers',       path: '/suppliers',       icon: Truck },
  { label: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingCart },
  { label: 'Shipments',       path: '/shipments',       icon: Ship },
  { label: 'Forecasting',     path: '/forecasting',     icon: TrendingUp },
  { label: 'Reports',         path: '/reports',         icon: FileText },
  { label: 'Notifications',   path: '/notifications',   icon: Bell },
];

const ADMIN_ONLY_NAV: NavItem[] = [
  { label: 'Users',      path: '/users',      icon: Users },
  { label: 'Audit Logs', path: '/audit-logs', icon: ClipboardList },
];

const MANAGER_NAV: NavItem[] = [
  { label: 'Dashboard',       path: '/dashboard',       icon: LayoutDashboard },
  { label: 'Inventory',       path: '/inventory',       icon: BarChart3 },
  { label: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingCart },
  { label: 'Shipments',       path: '/shipments',       icon: Ship },
  { label: 'Reports',         path: '/reports',         icon: FileText },
  { label: 'Notifications',   path: '/notifications',   icon: Bell },
];

// ─── Framer Motion variants ───────────────────────────────────────────────────

const sidebarVariants = {
  open:    { x: 0,   opacity: 1, transition: { type: 'spring' as const, stiffness: 260, damping: 28 } },
  closed:  { x: -20, opacity: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 28 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show:   { opacity: 1, x: 0,  transition: { duration: 0.18 } },
};

// ─── Nav Item component ───────────────────────────────────────────────────────

interface NavItemProps {
  item: NavItem;
  collapsed: boolean;
  unread?: number;
}

function SidebarNavItem({ item, collapsed, unread = 0 }: NavItemProps) {
  const Icon = item.icon;
  const showBadge = item.path === '/notifications' && unread > 0;

  return (
    <motion.div variants={itemVariants} whileHover={{ x: collapsed ? 0 : 4 }} transition={{ duration: 0.15 }}>
      <NavLink
        to={item.path}
        title={collapsed ? item.label : undefined}
        className={({ isActive }) =>
          [
            'nav-item group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
            isActive ? 'nav-item active' : '',
          ].join(' ')
        }
      >
        <span className="relative flex-shrink-0">
          <Icon className="w-4.5 h-4.5" style={{ width: '1.125rem', height: '1.125rem' }} />
          {showBadge && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </span>

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Tooltip for collapsed state */}
        {collapsed && (
          <span className="pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-lg bg-popover border border-border text-popover-foreground text-xs font-medium px-2.5 py-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            {item.label}
            {showBadge && (
              <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </span>
        )}
      </NavLink>
    </motion.div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const { user, logout: storeLogout, refreshToken } = useAuthStore();
  const { sidebarOpen, sidebarCollapsed, setSidebarCollapsed, setSidebarOpen, unreadNotifications } = useUIStore();
  const navigate = useNavigate();

  const isAdmin   = user?.role === 'ADMIN';
  const mainNav   = isAdmin ? ADMIN_NAV : MANAGER_NAV;
  const adminNav  = isAdmin ? ADMIN_ONLY_NAV : [];

  const handleLogout = async () => {
    try {
      await authApi.logout(refreshToken ?? '');
    } catch {
      /* swallow — token may already be expired */
    }
    storeLogout();
    toast.success('Logged out successfully');
    navigate('/login', { replace: true });
  };

  const toggleCollapse = () => setSidebarCollapsed(!sidebarCollapsed);

  // Initials for avatar
  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const sidebarWidth = sidebarCollapsed ? 'w-[70px]' : 'w-64';

  return (
    <motion.aside
      initial={false}
      animate={sidebarOpen || typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'open' : 'closed'}
      variants={sidebarVariants}
      className={[
        'relative flex-shrink-0 flex flex-col h-full',
        'bg-card border-r border-border',
        'transition-[width] duration-300 ease-in-out',
        sidebarWidth,
        // Mobile: fixed overlay; Desktop: static in flex row
        'fixed lg:static inset-y-0 left-0 z-30',
      ].join(' ')}
    >
      {/* ── Logo ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border flex-shrink-0">
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <BoxesIcon className="w-4.5 h-4.5 text-primary-foreground" style={{ width: '1.1rem', height: '1.1rem' }} />
          </div>
          {/* Pulsing online indicator */}
          <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
        </div>

        <AnimatePresence initial={false}>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="font-bold text-sm text-foreground whitespace-nowrap leading-tight">
                InvenTrack <span className="gradient-text">Pro</span>
              </p>
              <p className="text-[10px] text-muted-foreground whitespace-nowrap font-medium">
                v2.0 · Enterprise
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Collapse toggle (desktop only) ────────────────────────────────── */}
      <button
        onClick={toggleCollapse}
        className="hidden lg:flex absolute -right-3 top-[72px] z-10 w-6 h-6 rounded-full bg-card border border-border shadow-md items-center justify-center hover:bg-muted transition-colors"
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed
          ? <ChevronRight className="w-3 h-3 text-muted-foreground" />
          : <ChevronLeft  className="w-3 h-3 text-muted-foreground" />}
      </button>

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-0.5">
        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.04 } } }}
          initial="hidden"
          animate="show"
        >
          {mainNav.map((item) => (
            <SidebarNavItem
              key={item.path}
              item={item}
              collapsed={sidebarCollapsed}
              unread={unreadNotifications}
            />
          ))}
        </motion.div>

        {/* Administration section (admin only) */}
        {adminNav.length > 0 && (
          <>
            <div className="pt-3 pb-1 px-3">
              <AnimatePresence initial={false}>
                {!sidebarCollapsed ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                  >
                    Administration
                  </motion.p>
                ) : (
                  <div className="border-t border-border" />
                )}
              </AnimatePresence>
            </div>

            <motion.div
              variants={{ show: { transition: { staggerChildren: 0.04 } } }}
              initial="hidden"
              animate="show"
            >
              {adminNav.map((item) => (
                <SidebarNavItem
                  key={item.path}
                  item={item}
                  collapsed={sidebarCollapsed}
                />
              ))}
            </motion.div>
          </>
        )}
      </nav>

      {/* ── User card + Logout ────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-border p-3">
        <div
          className={[
            'flex items-center gap-3 px-2 py-2 rounded-xl',
            !sidebarCollapsed && 'bg-muted/50',
          ].join(' ')}
        >
          {/* Avatar */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            {initials}
          </div>

          <AnimatePresence initial={false}>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-xs font-semibold text-foreground truncate leading-tight">
                  {user?.fullName ?? 'Unknown User'}
                </p>
                <p className="text-[10px] text-muted-foreground truncate capitalize">
                  {user?.role?.toLowerCase() ?? 'user'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Logout button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            title="Logout"
            className={[
              'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center',
              'text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors',
            ].join(' ')}
          >
            <LogOut className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {/* Mobile close on ESC handled by overlay in AppLayout */}
    </motion.aside>
  );
}
