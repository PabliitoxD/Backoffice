"use client";

import './Topbar.css';
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, Bell } from "lucide-react";
import { useEffect, useState } from 'react';

import { API_URL } from '@/lib/api';

interface TopbarProps {
  onMenuClick: () => void;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  date: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const [firstName, setFirstName] = useState("Usuário");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.name) {
          setFirstName(user.name.split(' ')[0]);
        }
      } catch (e) {
        console.error("Erro ao carregar usuário", e);
      }
    }

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/financial/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error("Erro ao carregar notificações", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-toggle" onClick={onMenuClick} aria-label="Toggle Menu">
          <Menu size={24} />
        </button>
      </div>

      <div className="topbar-actions">
        <button
          className="icon-btn" 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <div className="notifications-container">
          <button 
            className="icon-btn" 
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="dropdown-header">Notificações</div>
              {notifications.length === 0 ? (
                <div className="empty-notifications">Nenhuma notificação nova</div>
              ) : (
                notifications.map(notif => (
                  <div key={notif.id} className="notification-item">
                    <span className="notification-title">{notif.title}</span>
                    <span className="notification-message">{notif.message}</span>
                    <div className="notification-meta">
                      <span className={`notification-priority priority-${notif.priority}`}>
                        {notif.priority}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        
        {/* User Profile */}
        <div className="user-profile">
          <div className="avatar">{firstName[0]}</div>
          <div className="user-info">
            <span className="user-name">{firstName}</span>
            <span className="user-role">Administrador</span>
          </div>
        </div>
      </div>
    </header>
  );
}
