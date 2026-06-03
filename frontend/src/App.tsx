import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { authApi } from './api';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ManagerDashboardPage from './pages/ManagerDashboardPage';
import WarehousesPage from './pages/WarehousesPage';
import ProductsPage from './pages/ProductsPage';
import InventoryPage from './pages/InventoryPage';
import SuppliersPage from './pages/SuppliersPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import ForecastingPage from './pages/ForecastingPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import UsersPage from './pages/UsersPage';
import AuditLogsPage from './pages/AuditLogsPage';
import ShipmentsPage from './pages/ShipmentsPage';
import StockTransfersPage from './pages/StockTransfersPage';
import BarcodeScannerPage from './pages/BarcodeScannerPage';
import SettingsPage from './pages/SettingsPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ background: '#0A0F1E' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center animate-pulse">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-gray-500 text-sm font-medium">Loading SupplySync AI…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function DashboardRouter() {
  const { user } = useAuthStore();
  return user?.role === 'ADMIN' ? <AdminDashboardPage /> : <ManagerDashboardPage />;
}

export default function App() {
  const { setAuth, setLoading, logout, accessToken, refreshToken } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }
      try {
        const user = await authApi.getMe();
        setAuth(user, accessToken, refreshToken ?? '');
      } catch {
        logout();
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardRouter />} />
          <Route path="warehouses" element={<WarehousesPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
          <Route path="shipments" element={<ShipmentsPage />} />
          <Route path="stock-transfers" element={<StockTransfersPage />} />
          <Route path="forecasting" element={<ForecastingPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="barcode-scanner" element={<BarcodeScannerPage />} />
          <Route
            path="settings"
            element={
              <ProtectedRoute adminOnly>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="users"
            element={
              <ProtectedRoute adminOnly>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="audit-logs"
            element={
              <ProtectedRoute adminOnly>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
