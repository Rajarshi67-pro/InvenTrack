import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Warehouse, Package, BarChart3, Truck,
  ShoppingCart, ArrowLeftRight, Brain, FileText, Bell,
  Users, ClipboardList, Settings, LogOut, Boxes, ScanLine,
  ChevronRight, Activity
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api';
import { toast } from 'sonner';

interface NavItem {
  label: string;
  icon: React.ElementType;
  to: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const ADMIN_NAV: NavGroup[] = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    ]
  },
  {
    title: 'OPERATIONS',
    items: [
      { label: 'Warehouses', icon: Warehouse, to: '/warehouses' },
      { label: 'Products', icon: Package, to: '/products' },
      { label: 'Inventory', icon: BarChart3, to: '/inventory' },
      { label: 'Suppliers', icon: Activity, to: '/suppliers' },
    ]
  },
  {
    title: 'PROCUREMENT',
    items: [
      { label: 'Purchase Orders', icon: ShoppingCart, to: '/purchase-orders' },
      { label: 'Shipments', icon: Truck, to: '/shipments' },
      { label: 'Stock Transfers', icon: ArrowLeftRight, to: '/stock-transfers' },
    ]
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { label: 'AI Forecasting', icon: Brain, to: '/forecasting' },
      { label: 'Reports', icon: FileText, to: '/reports' },
    ]
  },
  {
    title: 'ADMIN',
    items: [
      { label: 'Users', icon: Users, to: '/users' },
      { label: 'Audit Logs', icon: ClipboardList, to: '/audit-logs' },
      { label: 'Notifications', icon: Bell, to: '/notifications' },
      { label: 'Settings', icon: Settings, to: '/settings' },
    ]
  },
];

const MANAGER_NAV: NavGroup[] = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    ]
  },
  {
    title: 'OPERATIONS',
    items: [
      { label: 'Inventory', icon: BarChart3, to: '/inventory' },
      { label: 'Purchase Orders', icon: ShoppingCart, to: '/purchase-orders' },
      { label: 'Shipments', icon: Truck, to: '/shipments' },
      { label: 'Stock Transfers', icon: ArrowLeftRight, to: '/stock-transfers' },
    ]
  },
  {
    title: 'TOOLS',
    items: [
      { label: 'Barcode Scanner', icon: ScanLine, to: '/barcode-scanner' },
      { label: 'Reports', icon: FileText, to: '/reports' },
      { label: 'Notifications', icon: Bell, to: '/notifications' },
    ]
  },
];

export default function Sidebar() {
  const { user, logout: storeLogout, refreshToken } = useAuthStore();
  const location = useLocation();
  const nav = user?.role === 'ADMIN' ? ADMIN_NAV : MANAGER_NAV;

  const handleLogout = async () => {
    try {
      await authApi.logout(refreshToken ?? '');
    } catch {
      // ignore logout API errors
    }
    storeLogout();
    toast.success('Signed out successfully');
  };

  const isActive = (to: string) => {
    if (to === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(to);
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-0 h-screen w-[260px] flex flex-col z-30"
      style={{
        background: 'linear-gradient(180deg, #0D1424 0%, #0A0F1E 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)'
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
          <Boxes className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-base font-bold text-white tracking-tight">SupplySync AI</div>
          <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Enterprise Platform</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
        {nav.map((group) => (
          <div key={group.title}>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-3 mb-2">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.to);
                return (
                  <NavLink key={item.to} to={item.to}>
                    <div className={active ? 'sidebar-item-active' : 'sidebar-item'}>
                      <item.icon
                        className={`w-4 h-4 flex-shrink-0 ${active ? 'text-blue-400' : ''}`}
                      />
                      <span className="flex-1">{item.label}</span>
                      {active && <ChevronRight className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4 border-t border-white/[0.06] pt-3">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{user?.fullName}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">{user?.role}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </motion.aside>
  );
}
