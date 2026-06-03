import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen" style={{ background: '#0A0F1E' }}>
      <Sidebar />
      <Topbar />
      <main
        style={{
          marginLeft: '260px',
          marginTop: '64px',
          padding: '32px',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
