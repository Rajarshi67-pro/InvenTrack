import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { authApi } from '../../api';
import { toast } from 'sonner';

// ─── Route → Breadcrumb map ───────────────────────────────────────────────────

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard':       'Dashboard',
  '/warehouses':      'Warehouses',
  '/products':        'Products',
  '/inventory':       'Inventory',
  '/suppliers':       'Suppliers',
  '/purchase-orders': 'Purchase Orders',
  '/shipments':       'Shipments',
  '/forecasting':     'Forecasting',
  '/reports':         'Reports',
  '/notifications':   'Notifications',
  '/users':           'Users',
  '/audit-logs':      'Audit Logs',
};

// ─── Dropdown Variants ────────────────────────────────────────────────────────

const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -6 },
  show:   { opacity: 1, scale: 1,    y: 0, transition: { duration: 0.15, ease: [0.33, 1, 0.68, 1] as any } },
  exit:   { opacity: 0, scale: 0.95, y: -6, transition: { duration: 0.1 } },
};

// ─── Topbar ───────────────────────────────────────────────────────────────────

export default function Topbar() {
  const { user, logout: storeLogout, refreshToken } = useAuthStore();
  const { toggleSidebar, toggleTheme, theme, unreadNotifications } = useUIStore();
  const location = useLocation();
  const navigate  = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Determine current page title from pathname
  const pageTitle = ROUTE_LABELS[location.pathname] ?? 'InvenTrack Pro';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      await authApi.logout(refreshToken ?? '');
    } catch {
      /* swallow */
    }
    storeLogout();
    toast.success('Logged out successfully');
    navigate('/login', { replace: true });
  };

  // Initials for avatar
  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <header className="flex-shrink-0 h-14 flex items-center gap-4 px-4 sm:px-6 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-10">
      {/* ── Mobile hamburger ─────────────────────────────────────────────── */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ── Page title / breadcrumb ───────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-foreground truncate">{pageTitle}</h1>
        <p className="text-[11px] text-muted-foreground hidden sm:block">
          InvenTrack Pro &rsaquo; {pageTitle}
        </p>
      </div>

      {/* ── Right-side controls ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <AnimatePresence mode="wait" initial={false}>
            {theme === 'dark' ? (
              <motion.div
                key="sun"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <Sun className="w-4.5 h-4.5" style={{ width: '1.1rem', height: '1.1rem' }} />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ opacity: 0, rotate: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }}
                transition={{ duration: 0.2 }}
              >
                <Moon className="w-4.5 h-4.5" style={{ width: '1.1rem', height: '1.1rem' }} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Notifications bell */}
        <Link
          to="/notifications"
          className="relative w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label={`Notifications${unreadNotifications > 0 ? ` (${unreadNotifications} unread)` : ''}`}
        >
          <Bell className="w-4.5 h-4.5" style={{ width: '1.1rem', height: '1.1rem' }} />
          {unreadNotifications > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none px-0.5"
            >
              {unreadNotifications > 99 ? '99+' : unreadNotifications}
            </motion.span>
          )}
        </Link>

        {/* User avatar + dropdown ─────────────────────────────────────────── */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-muted transition-colors group"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            {/* Avatar circle */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0">
              {initials}
            </div>

            {/* Name + role (hidden on small screens) */}
            <div className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-xs font-semibold text-foreground max-w-[100px] truncate">
                {user?.fullName ?? 'User'}
              </span>
              <span className="text-[10px] text-muted-foreground capitalize">
                {user?.role?.toLowerCase() ?? ''}
              </span>
            </div>

            <motion.div
              animate={{ rotate: dropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </motion.div>
          </button>

          {/* Dropdown menu */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                key="dropdown"
                variants={dropdownVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                {/* User info header */}
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user?.fullName ?? 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {user?.email ?? ''}
                  </p>
                  <span className="inline-flex mt-1.5 items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary capitalize">
                    {user?.role?.toLowerCase() ?? 'user'}
                  </span>
                </div>

                {/* Menu items */}
                <div className="p-1.5">
                  <Link
                    to="/notifications"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-muted transition-colors group"
                  >
                    <User className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    Profile
                  </Link>

                  <Link
                    to="/notifications"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-muted transition-colors group"
                  >
                    <Settings className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    Settings
                  </Link>

                  <div className="border-t border-border my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
