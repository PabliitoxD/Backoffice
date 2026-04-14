"use client";

import { useState, useCallback } from "react";
import DashboardFilter from "@/components/dashboard/DashboardFilter";
import DashboardStatsGrid from "@/components/dashboard/DashboardStatsGrid";
import styles from "./page.module.css";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async (start: Date, end: Date) => {
    setLoading(true);
    try {
      const startStr = start.toISOString();
      const endStr = end.toISOString();
      
      // Using relative URL. In production, this would be handled by a proxy or base URL.
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${API_URL}/financial/stats?startDate=${startStr}&endDate=${endStr}`, {
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${localStorage.getItem('token')}` // Uncomment if auth is needed
        }
      });
      
      if (!res.ok) throw new Error("Failed to fetch stats");
      
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className="title">Dashboard Financeiro</h1>
        <p className="subtitle">Visão geral em tempo real com comparativo de performance.</p>
      </div>

      <DashboardFilter onFilterChange={fetchStats} />

      {loading ? (
        <div className={styles.loadingWrapper}>
           <div className={styles.spinner}></div>
           <p>Calculando métricas e comparativos...</p>
        </div>
      ) : (
        <DashboardStatsGrid data={stats} />
      )}
    </div>
  );
}

