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
} from "date-fns";

type FilterType = "TODAY" | "WEEK" | "MONTH" | "CUSTOM";

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

const IconTPV = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const IconRevenue = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const IconTransactions = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const IconWithdrawal = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const IconChargeback = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconCustomers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconRefresh = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterType, setFilterType] = useState<FilterType>("TODAY");
  const [customRange, setCustomRange] = useState({
    start: format(new Date(), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  });

  const getRange = useCallback(() => {
    let start = new Date();
    let end = new Date();

    switch (filterType) {
      case "TODAY":
        start = startOfDay(new Date());
        end = endOfDay(new Date());
        break;
      case "WEEK":
        start = startOfWeek(new Date(), { weekStartsOn: 0 });
        end = endOfDay(new Date());
        break;
      case "MONTH":
        start = startOfMonth(new Date());
        end = endOfDay(new Date());
        break;
      case "CUSTOM":
        start = new Date(customRange.start + "T00:00:00");
        end = new Date(customRange.end + "T23:59:59");
        break;
    }

    return { start: start.toISOString(), end: end.toISOString() };
  }, [filterType, customRange]);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const { start, end } = getRange();
      const token = localStorage.getItem("token");
      const url = new URL(`${API_URL}/financial/dashboard-summary`, window.location.origin);
      url.searchParams.append("startDate", start);
      url.searchParams.append("endDate", end);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
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

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("pt-BR").format(value);

  const getPeriodLabel = () => {
    if (filterType === "TODAY") return "hoje";
    if (filterType === "WEEK") return "esta semana";
    if (filterType === "MONTH") return "este mês";
    return "no período";
  };

  const maxTpv = stats?.topTpv?.[0]?.value || 1;
  const maxWithdrawal = stats?.topWithdrawals?.[0]?.value || 1;

  return (
    <div className={styles.dashboard}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSubtitle}>Visão consolidada de todos os clientes</p>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.filterGroup}>
            {[
              { id: "TODAY", label: "Hoje" },
              { id: "WEEK", label: "Semana" },
              { id: "MONTH", label: "Mês" },
              { id: "CUSTOM", label: "Período" },
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

          {filterType === "CUSTOM" && (
            <div className={styles.customDateGroup}>
              <input
                type="date"
                value={customRange.start}
                onChange={(e) => setCustomRange((p) => ({ ...p, start: e.target.value }))}
                className={styles.dateInput}
              />
              <span className={styles.dateSeparator}>→</span>
              <input
                type="date"
                value={customRange.end}
                onChange={(e) => setCustomRange((p) => ({ ...p, end: e.target.value }))}
                className={styles.dateInput}
              />
            </div>
          )}

          <button className={styles.refreshBtn} onClick={fetchStats} title="Atualizar dados">
            <IconRefresh />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className={styles.errorBanner}>
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {/* Primary KPIs */}
      <div className={styles.primaryGrid}>
        <div className={`${styles.kpiCard} ${styles.kpiPrimary} ${loading ? styles.skeleton : ""}`}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>TPV Total</span>
            <span className={`${styles.kpiIconWrap} ${styles.iconWrapBlue}`}><IconTPV /></span>
          </div>
          <div className={styles.kpiValue}>{loading ? " " : formatCurrency(stats?.tpv || 0)}</div>
          <div className={styles.kpiMeta}>Volume processado {getPeriodLabel()}</div>
        </div>

        <div className={`${styles.kpiCard} ${styles.kpiSecondary} ${loading ? styles.skeleton : ""}`}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Receita Líquida</span>
            <span className={`${styles.kpiIconWrap} ${styles.iconWrapTeal}`}><IconRevenue /></span>
          </div>
          <div className={styles.kpiValue}>{loading ? " " : formatCurrency(stats?.revenue || 0)}</div>
          <div className={styles.kpiMeta}>Taxas e tarifas cobradas</div>
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className={styles.secondaryGrid}>
        <div className={`${styles.kpiCard} ${styles.kpiSm} ${loading ? styles.skeleton : ""}`}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Transações</span>
            <span className={`${styles.kpiIconWrap} ${styles.iconWrapSlate}`}><IconTransactions /></span>
          </div>
          <div className={`${styles.kpiValue} ${styles.kpiValueSm}`}>
            {loading ? " " : formatNumber(stats?.transactionsCount || 0)}
          </div>
          <div className={styles.kpiMeta}>Operações {getPeriodLabel()}</div>
        </div>

        <div className={`${styles.kpiCard} ${styles.kpiSm} ${loading ? styles.skeleton : ""}`}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Saques Pagos</span>
            <span className={`${styles.kpiIconWrap} ${styles.iconWrapSlate}`}><IconWithdrawal /></span>
          </div>
          <div className={`${styles.kpiValue} ${styles.kpiValueSm}`}>
            {loading ? " " : formatCurrency(stats?.withdrawalsCompletedVolume || 0)}
          </div>
          <div className={styles.kpiMeta}>
            {loading ? " " : `${formatNumber(stats?.withdrawalsCompletedCount || 0)} saques aprovados`}
          </div>
        </div>

        <div className={`${styles.kpiCard} ${styles.kpiSm} ${styles.kpiCardDanger} ${loading ? styles.skeleton : ""}`}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Chargebacks</span>
            <span className={`${styles.kpiIconWrap} ${styles.iconWrapDanger}`}><IconChargeback /></span>
          </div>
          <div className={`${styles.kpiValue} ${styles.kpiValueSm} ${styles.valueDanger}`}>
            {loading ? " " : formatCurrency(stats?.chargebackVolume || 0)}
          </div>
          <div className={styles.kpiMeta}>
            {loading ? " " : `${formatNumber(stats?.chargebackCount || 0)} ocorrências`}
          </div>
        </div>

        <div className={`${styles.kpiCard} ${styles.kpiSm} ${loading ? styles.skeleton : ""}`}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Clientes Ativos</span>
            <span className={`${styles.kpiIconWrap} ${styles.iconWrapSlate}`}><IconCustomers /></span>
          </div>
          <div className={`${styles.kpiValue} ${styles.kpiValueSm}`}>
            {loading ? " " : formatNumber(stats?.totalCustomers || 0)}
          </div>
          <div className={styles.kpiMeta}>Total cadastrado</div>
        </div>
      </div>

      {/* Rankings */}
      <div className={styles.rankingGrid}>
        <div className={styles.rankingCard}>
          <div className={styles.rankingCardHeader}>
            <h2 className={styles.rankingTitle}>TOP 5 — Volume de Vendas</h2>
            <p className={styles.rankingSubtitle}>Clientes com maior TPV {getPeriodLabel()}</p>
          </div>
          <div className={styles.rankingList}>
            {loading && [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`${styles.rankingSkeletonRow} ${styles.skeleton}`} />
            ))}
            {!loading && (!stats?.topTpv || stats.topTpv.length === 0) && (
              <p className={styles.noData}>Nenhum dado no período selecionado.</p>
            )}
            {!loading && stats?.topTpv.map((item, idx) => (
              <div key={idx} className={styles.rankingItem}>
                <span className={`${styles.rankPos} ${idx === 0 ? styles.rankGold : idx === 1 ? styles.rankSilver : idx === 2 ? styles.rankBronze : styles.rankDefault}`}>
                  {idx + 1}
                </span>
                <div className={styles.rankInfo}>
                  <div className={styles.rankRow}>
                    <span className={styles.rankName}>{item.name}</span>
                    <span className={styles.rankValue}>{formatCurrency(item.value)}</span>
                  </div>
                  <div className={styles.rankBar}>
                    <div className={styles.rankBarFill} style={{ width: `${(item.value / maxTpv) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.rankingCard}>
          <div className={styles.rankingCardHeader}>
            <h2 className={styles.rankingTitle}>TOP 5 — Saques Aprovados</h2>
            <p className={styles.rankingSubtitle}>Clientes com maior volume de saques {getPeriodLabel()}</p>
          </div>
          <div className={styles.rankingList}>
            {loading && [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`${styles.rankingSkeletonRow} ${styles.skeleton}`} />
            ))}
            {!loading && (!stats?.topWithdrawals || stats.topWithdrawals.length === 0) && (
              <p className={styles.noData}>Nenhum dado no período selecionado.</p>
            )}
            {!loading && stats?.topWithdrawals.map((item, idx) => (
              <div key={idx} className={styles.rankingItem}>
                <span className={`${styles.rankPos} ${idx === 0 ? styles.rankGold : idx === 1 ? styles.rankSilver : idx === 2 ? styles.rankBronze : styles.rankDefault}`}>
                  {idx + 1}
                </span>
                <div className={styles.rankInfo}>
                  <div className={styles.rankRow}>
                    <span className={styles.rankName}>{item.name}</span>
                    <span className={styles.rankValue}>{formatCurrency(item.value)}</span>
                  </div>
                  <div className={styles.rankBar}>
                    <div className={`${styles.rankBarFill} ${styles.rankBarTeal}`} style={{ width: `${(item.value / maxWithdrawal) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
