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

// ─── Protected Route Guard ────────────────────────────────────────────────────

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm font-medium tracking-wide">
            Loading InvenTrack…
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

// ─── Role-based Dashboard Router ─────────────────────────────────────────────

function DashboardRouter() {
  const { user } = useAuthStore();
  return user?.role === 'ADMIN' ? <AdminDashboardPage /> : <ManagerDashboardPage />;
}

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  const { setAuth, setLoading, logout, accessToken, refreshToken } = useAuthStore();

  /**
   * On mount, verify the persisted access token is still valid by calling
   * /auth/me. If it fails the interceptor in api/client.ts will attempt a
   * token refresh via the refresh token; if that also fails we logout.
   */
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
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected shell — all children render inside AppLayout */}
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
          <Route path="forecasting" element={<ForecastingPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />

          {/* Admin-only routes */}
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

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
