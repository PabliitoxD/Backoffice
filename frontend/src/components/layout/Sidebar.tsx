"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './Sidebar.css';
import { X, ChevronDown, LayoutDashboard, Users, CreditCard, ArrowLeftRight, FileText, ArrowDownToLine, AlertTriangle, Activity, Settings } from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Clientes', href: '/clients', icon: Users },
  { label: 'Planos e Liquidação', href: '/plans', icon: CreditCard },
  { label: 'Transações', href: '/transactions', icon: ArrowLeftRight },
  {
    label: 'Extrato',
    href: '/financial/statement',
    icon: FileText,
    subItems: [
      { label: 'Extrato', href: '/financial/statement' },
      { label: 'Recebíveis', href: '/financial/receivables' },
    ],
  },
  { label: 'Saques', href: '/financial/withdrawals', icon: ArrowDownToLine },
  { label: 'Chargebacks', href: '/financial/chargebacks', icon: AlertTriangle },
  {
    label: 'Monitoramento',
    href: '/monitoring',
    icon: Activity,
    subItems: [
      { label: 'Monitoramento', href: '/monitoring' },
      { label: 'Ocorrências', href: '/monitoring/occurrences' },
    ],
  },
  { label: 'Configurações', href: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    NAV_ITEMS.forEach(item => {
      if ('subItems' in item && item.subItems) {
        if (item.subItems.some(sub => pathname === sub.href)) {
          initial[item.label] = true;
        }
      }
    });
    return initial;
  });

  const toggleDropdown = (label: string) => {
    setOpenDropdowns(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href: string) => pathname === href;
  const isGroupActive = (item: typeof NAV_ITEMS[0]) => {
    if ('subItems' in item && item.subItems) {
      return item.subItems.some(sub => pathname === sub.href);
    }
    return pathname === item.href;
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/login';
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <img src="/logo-tronnus.png" alt="Tronnus" className="sidebar-logo" />
        <button className="sidebar-close" onClick={onClose} aria-label="Close Menu">
          <X size={24} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const hasDropdown = 'subItems' in item && item.subItems && item.subItems.length > 0;
            const isDropdownOpen = openDropdowns[item.label];
            const groupActive = isGroupActive(item);

            if (hasDropdown) {
              return (
                <li key={item.label}>
                  <button
                    className={`sidebar-link sidebar-dropdown-toggle ${groupActive ? 'active' : ''}`}
                    onClick={() => toggleDropdown(item.label)}
                  >
                    <Icon size={18} className="sidebar-icon" />
                    <span>{item.label}</span>
                    <ChevronDown
                      size={15}
                      className={`sidebar-chevron ${isDropdownOpen ? 'open' : ''}`}
                    />
                  </button>
                  {isDropdownOpen && (
                    <ul className="sidebar-submenu">
                      {item.subItems!.map((sub) => (
                        <li key={sub.href}>
                          <Link
                            href={sub.href}
                            className={`sidebar-submenu-link ${isActive(sub.href) ? 'active' : ''}`}
                            onClick={handleLinkClick}
                          >
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
                  onClick={handleLinkClick}
                >
                  <Icon size={18} className="sidebar-icon" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          Sair
        </button>
      </div>
    </aside>
  );
}
