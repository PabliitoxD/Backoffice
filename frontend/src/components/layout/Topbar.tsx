"use client";

import './Topbar.css';
import { useTheme } from "next-themes";
import { Sun, Moon, Menu } from "lucide-react";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-toggle" onClick={onMenuClick} aria-label="Toggle Menu">
          <Menu size={24} />
        </button>
        <div className="topbar-search">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Pesquisar..." className="search-input" />
        </div>
      </div>

      <div className="topbar-actions">
        <button 
          className="icon-btn" 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications Mock */}
        <button className="icon-btn">
          <span className="icon">🔔</span>
          <span className="badge">3</span>
        </button>
        
        {/* User Profile Mock */}
        <div className="user-profile">
          <div className="avatar">A</div>
          <div className="user-info">
            <span className="user-name">Administrador</span>
            <span className="user-role">Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
