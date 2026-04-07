import Link from 'next/link';
import './Sidebar.css';

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

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Admin Pro</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <Link href={item.href} className="sidebar-link">
                <span className="sidebar-icon">{item.icon}</span>
                {item.label}
              </Link>
              {item.subItems && (
                <ul className="sidebar-submenu">
                  {item.subItems.map((subItem) => (
                    <li key={subItem.label}>
                      <Link href={subItem.href} className="sidebar-submenu-link">
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
        <button className="logout-btn">
          <span>🚪</span> Sair
        </button>
      </div>
    </aside>
  );
}
