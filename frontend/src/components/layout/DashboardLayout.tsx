import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import './DashboardLayout.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-main">
        <Topbar />
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}
