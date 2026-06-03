import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/warehouses': 'Warehouse Management',
  '/products': 'Product Catalog',
  '/inventory': 'Inventory Management',
  '/suppliers': 'Supplier Management',
  '/purchase-orders': 'Purchase Orders',
  '/shipments': 'Shipment Tracking',
  '/stock-transfers': 'Stock Transfers',
  '/forecasting': 'AI Forecasting Center',
  '/reports': 'Reports & Analytics',
  '/notifications': 'Notification Center',
  '/users': 'User Management',
  '/audit-logs': 'Audit Logs',
  '/settings': 'System Settings',
  '/barcode-scanner': 'Barcode Scanner',
};

export default function Topbar() {
  const { user } = useAuthStore();
  const location = useLocation();
  const pageTitle = ROUTE_LABELS[location.pathname] ?? 'SupplySync AI';

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="fixed top-0 right-0 h-16 flex items-center justify-between px-6 z-20"
      style={{
        left: '260px',
        background: 'rgba(10, 15, 30, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}
    >
      {/* Page title */}
      <div>
        <h1 className="text-lg font-bold text-white">{pageTitle}</h1>
        <p className="text-xs text-gray-600">
          {user?.role === 'ADMIN' ? 'Administrator View' : 'Manager View'}
        </p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors">
          <Bell className="w-4 h-4 text-gray-400" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
            4
          </span>
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-blue-500/20">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold text-white leading-tight">{user?.fullName}</div>
            <div className="text-[10px] text-gray-600 uppercase tracking-wider">{user?.role}</div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
