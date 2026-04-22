"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./page.module.css";
import { API_URL } from "@/lib/api";
import { 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  startOfMonth, 
  format 
} from "date-fns";

type FilterType = 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM';

interface RankingItem {
  name: string;
  value: number;
}

interface DashboardStats {
  revenue: number;
  revenueTrend: number;
  tpv: number;
  tpvTrend: number;
  chargebackCount: number;
  chargebackVolume: number;
  transactionsCount: number;
  transactionsTrend: number;
  withdrawalsCompletedVolume: number;
  withdrawalsCompletedCount: number;
  topTpv: RankingItem[];
  topWithdrawals: RankingItem[];
  totalCustomers: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filterType, setFilterType] = useState<FilterType>('TODAY');
  const [customRange, setCustomRange] = useState({
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  const getRange = useCallback(() => {
    let start = new Date();
    let end = new Date();

    switch (filterType) {
      case 'TODAY':
        start = startOfDay(new Date());
        end = endOfDay(new Date());
        break;
      case 'WEEK':
        start = startOfWeek(new Date(), { weekStartsOn: 0 }); // Domingo
        end = endOfDay(new Date());
        break;
      case 'MONTH':
        start = startOfMonth(new Date());
        end = endOfDay(new Date());
        break;
      case 'CUSTOM':
        start = new Date(customRange.start + 'T00:00:00');
        end = new Date(customRange.end + 'T23:59:59');
        break;
    }

    return {
      start: start.toISOString(),
      end: end.toISOString()
    };
  }, [filterType, customRange]);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const { start, end } = getRange();
      const token = localStorage.getItem("token");
      const url = new URL(`${API_URL}/financial/dashboard-summary`);
      url.searchParams.append("startDate", start);
      url.searchParams.append("endDate", end);

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Falha ao carregar estatísticas");

      const data = await res.json();
      setStats(data);
      setError(null);
    } catch (err: any) {
      console.error("Dashboard error:", err);
      setError("Não foi possível carregar os dados. Verifique a conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }, [getRange]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getTimeLabel = () => {
    if (filterType === 'TODAY') return "de hoje";
    if (filterType === 'WEEK') return "da semana";
    if (filterType === 'MONTH') return "do mês";
    return "do período";
  };

  const formatTrend = (value: number | undefined) => {
    if (value === undefined) return "...";
    const prefix = value >= 0 ? "+" : "";
    return `${prefix}${value.toFixed(1)}%`;
  };

  const STATS_CARDS = [
    { 
      title: "Receita (Lucro)", 
      value: loading ? "..." : formatCurrency(stats?.revenue || 0), 
      trend: formatTrend(stats?.revenueTrend), 
      isPositive: (stats?.revenueTrend || 0) >= 0 
    },
    { 
      title: "TPV total", 
      value: loading ? "..." : formatCurrency(stats?.tpv || 0), 
      trend: formatTrend(stats?.tpvTrend), 
      isPositive: (stats?.tpvTrend || 0) >= 0 
    },
    { 
      title: "Chargebacks", 
      value: loading ? "..." : formatCurrency(stats?.chargebackVolume || 0), 
      trend: `${stats?.chargebackCount || 0} ocorrências`, 
      isPositive: false 
    },
    { 
      title: "Transações", 
      value: loading ? "..." : (stats?.transactionsCount || 0).toString(), 
      trend: formatTrend(stats?.transactionsTrend), 
      isPositive: (stats?.transactionsTrend || 0) >= 0 
    },
    { 
      title: "Saques Processados", 
      value: loading ? "..." : formatCurrency(stats?.withdrawalsCompletedVolume || 0), 
      trend: `${stats?.withdrawalsCompletedCount || 0} saques pagos`, 
      isPositive: true 
    },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h1 className="title">Dashboard Administrativo</h1>
          <p className="subtitle">Relatórios consolidados de todos os clientes.</p>
        </div>

        <div className={styles.filterContainer}>
          <div className={styles.filterGroup}>
            {[
              { id: 'TODAY', label: 'Hoje' },
              { id: 'WEEK', label: 'Semana' },
              { id: 'MONTH', label: 'Mês' },
              { id: 'CUSTOM', label: 'Personalizado' },
            ].map((f) => (
              <button
                key={f.id}
                className={`${styles.filterBtn} ${filterType === f.id ? styles.filterBtnActive : ""}`}
                onClick={() => setFilterType(f.id as FilterType)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filterType === 'CUSTOM' && (
            <div className={styles.customDateGroup}>
              <input 
                type="date" 
                value={customRange.start}
                onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                className={styles.dateInput}
              />
              <span style={{ color: 'var(--text-muted)' }}>-</span>
              <input 
                type="date" 
                value={customRange.end}
                onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                className={styles.dateInput}
              />
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <p>⚠️ {error}</p>
        </div>
      )}

      {/* Grid Centralizado de Stats */}
      <div className={styles.statsContainer}>
        <div className={styles.statsGrid}>
          {STATS_CARDS.map((stat, idx) => (
            <div key={idx} className={`${styles.statCard} ${loading ? styles.skeleton : ""}`}>
              <h3 className={styles.cardTitle}>{stat.title}</h3>
              <div className={styles.cardBody}>
                <span className={styles.cardValue}>{stat.value}</span>
                <span className={`${styles.cardTrend} ${stat.isPositive ? styles.trendUp : styles.trendDown}`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ranking / TOP 5 Section */}
      <div className={styles.rankingGrid}>
        <div className="card">
          <div className={styles.cardHeader}>
            <h2 className="title">TOP 5 TPV (Vendas)</h2>
          </div>
          <div className={styles.rankingList}>
            {!loading && stats?.topTpv.map((item, idx) => (
              <div key={idx} className={styles.rankingItem}>
                <span className={styles.rankingName}>{idx + 1}. {item.name}</span>
                <span className={styles.rankingValue}>{formatCurrency(item.value)}</span>
              </div>
            ))}
            {(!loading && stats?.topTpv.length === 0) && <p className={styles.noData}>Nenhum dado no período.</p>}
            {loading && <div className={styles.skeleton} style={{ height: '200px' }}></div>}
          </div>
        </div>

        <div className="card">
          <div className={styles.cardHeader}>
            <h2 className="title">TOP 5 Saques Aprovados</h2>
          </div>
          <div className={styles.rankingList}>
            {!loading && stats?.topWithdrawals.map((item, idx) => (
              <div key={idx} className={styles.rankingItem}>
                <span className={styles.rankingName}>{idx + 1}. {item.name}</span>
                <span className={styles.rankingValue}>{formatCurrency(item.value)}</span>
              </div>
            ))}
            {(!loading && stats?.topWithdrawals.length === 0) && <p className={styles.noData}>Nenhum dado no período.</p>}
            {loading && <div className={styles.skeleton} style={{ height: '200px' }}></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
