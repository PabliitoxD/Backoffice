"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./page.module.css";
import { API_URL } from "@/lib/api";
import { 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  startOfMonth, 
  format,
  subDays 
} from "date-fns";

type FilterType = 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM';

interface DashboardStats {
  periodVolume: number;
  periodCount: number;
  totalVolume: number;
  activeProducers: number;
  totalCustomers: number;
  periodCustomers: number;
  pendingWithdrawalsVolume: number;
  pendingWithdrawalsCount: number;
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
        // Considera semana começando no último domingo (ou segunda, dependendo da config)
        // Aqui usamos startOfWeek padrão (domingo)
        start = startOfWeek(new Date());
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
      setError("Não foi possível carregar os dados reais.");
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

  const getSubTitleSuffix = () => {
    if (filterType === 'TODAY') return "de hoje";
    if (filterType === 'WEEK') return "desta semana";
    if (filterType === 'MONTH') return "deste mês";
    return "no período selecionado";
  };

  const STATS_CARDS = [
    { 
      title: "Volume Período", 
      value: loading ? "..." : formatCurrency(stats?.periodVolume || 0), 
      trend: getSubTitleSuffix(), 
      isPositive: true 
    },
    { 
      title: "Vendas Período", 
      value: loading ? "..." : (stats?.periodCount || 0).toString(), 
      trend: "Transações aprovadas", 
      isPositive: true 
    },
    { 
      title: "Novos Clientes", 
      value: loading ? "..." : (stats?.periodCustomers || 0).toString(), 
      trend: getSubTitleSuffix(), 
      isPositive: true 
    },
    { 
      title: "Saques Pendentes", 
      value: loading ? "..." : formatCurrency(stats?.pendingWithdrawalsVolume || 0), 
      trend: `${stats?.pendingWithdrawalsCount || 0} solicitações`, 
      isPositive: false 
    },
    { 
      title: "Volume Total", 
      value: loading ? "..." : formatCurrency(stats?.totalVolume || 0), 
      trend: "Acumulado histórico", 
      isPositive: true 
    },
    { 
      title: "Base de Clientes", 
      value: loading ? "..." : (stats?.totalCustomers || 0).toString(), 
      trend: "Total cadastrado", 
      isPositive: true 
    },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h1 className="title">Dashboard Financeiro</h1>
          <p className="subtitle">Visão geral do sistema de pagamentos e produtores.</p>
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
              <span style={{ color: 'var(--text-muted)' }}>até</span>
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
          <p>⚠️ {error} Exibindo valores zerados para visualização.</p>
        </div>
      )}

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

      <div className={styles.recentGrid}>
        <div className="card">
          <div className={styles.cardHeader}>
            <div>
              <h2 className="title">Atividade Recente</h2>
              <p className="subtitle">Resumo das operações realizadas no período selecionado.</p>
            </div>
          </div>
          <div className={styles.placeholderContent}>
            <p>Os dados detalhados da atividade aparecerão aqui conforme o desenvolvimento dos módulos.</p>
            <p>Os filtros acima estão integrados e refletem os resultados em tempo real do banco de dados.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
