import Link from 'next/link';
import './Sidebar.css';
import { X } from 'lucide-react';

// Mock data for navigation links
const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: '📊' },
  { label: 'Clientes', href: '/clients', icon: '👥' },
  { label: 'Planos e Liquidação', href: '/plans', icon: '💳' },
  { label: 'Transações', href: '/transactions', icon: '💰' },
  { 
    label: 'Extrato', 
    href: '/financial/statement', 
    icon: '🧾',
    subItems: [
      { label: 'Recebíveis', href: '/financial/receivables' }
    ]
  },
  { label: 'Saques', href: '/financial/withdrawals', icon: '🏦' },
  { label: 'Chargebacks', href: '/financial/chargebacks', icon: '⚠️' },
  { label: 'Configurações', href: '/settings', icon: '⚙️' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/login';
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>Admin Pro</h2>
        <button className="sidebar-close" onClick={onClose} aria-label="Close Menu">
          <X size={24} />
        </button>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <Link href={item.href} className="sidebar-link" onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}>
                <span className="sidebar-icon">{item.icon}</span>
                {item.label}
              </Link>
              {item.subItems && (
                <ul className="sidebar-submenu">
                  {item.subItems.map((subItem) => (
                    <li key={subItem.label}>
                      <Link 
                        href={subItem.href} 
                        className="sidebar-submenu-link"
                        onClick={() => {
                          if (window.innerWidth < 1024) onClose();
                        }}
                      >
                        {subItem.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
      {/* Footer of the sidebar, e.g., for logout or user profile snippet */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <span>🚪</span> Sair
        </button>
      </div>
    </aside>
  );
}
