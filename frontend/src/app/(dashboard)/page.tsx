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
type PaymentMethod = "pix" | "card" | "boleto";

interface MethodBreakdown {
  pix: number;
  card: number;
  boleto: number;
}

interface RankingItem {
  name: string;
  value: number;
}

interface RankingItemWithTrend {
  name: string;
  currentValue: number;
  prevValue: number;
  trend: number;
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
  tpvByMethod: MethodBreakdown;
  txCountByMethod: MethodBreakdown;
  cardConversionRate: number;
  topTpvMonthly: RankingItemWithTrend[];
  topRevenue: RankingItem[];
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

const IconConversion = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const METHOD_LABELS: Record<PaymentMethod, string> = { pix: "PIX", card: "Cartão", boleto: "Boleto" };
const METHOD_COLORS: Record<PaymentMethod, string> = { pix: "#38BDF8", card: "#818CF8", boleto: "#34D399" };

function MethodTabs({
  active,
  onChange,
}: {
  active: PaymentMethod;
  onChange: (m: PaymentMethod) => void;
}) {
  return (
    <div className={styles.methodTabs}>
      {(["pix", "card", "boleto"] as PaymentMethod[]).map((m) => (
        <button
          key={m}
          className={`${styles.methodTab} ${active === m ? styles.methodTabActive : ""}`}
          style={active === m ? { borderColor: METHOD_COLORS[m], color: METHOD_COLORS[m] } : {}}
          onClick={() => onChange(m)}
        >
          {METHOD_LABELS[m]}
        </button>
      ))}
    </div>
  );
}

function methodPercent(breakdown: MethodBreakdown, key: PaymentMethod): number {
  const total = breakdown.pix + breakdown.card + breakdown.boleto;
  if (total === 0) return 0;
  return (breakdown[key] / total) * 100;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterType, setFilterType] = useState<FilterType>("TODAY");
  const [customRange, setCustomRange] = useState({
    start: format(new Date(), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  });

  const [tpvMethod, setTpvMethod] = useState<PaymentMethod>("pix");
  const [txMethod, setTxMethod] = useState<PaymentMethod>("pix");

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

  const maxRevenue = stats?.topRevenue?.[0]?.value || 1;

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
        {/* TPV Total + breakdown por método */}
        <div className={`${styles.kpiCard} ${styles.kpiPrimary} ${loading ? styles.skeleton : ""}`}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>TPV Total</span>
            <span className={`${styles.kpiIconWrap} ${styles.iconWrapBlue}`}><IconTPV /></span>
          </div>
          <div className={styles.kpiValue}>{loading ? " " : formatCurrency(stats?.tpv || 0)}</div>
          <div className={styles.kpiMeta}>Volume processado {getPeriodLabel()}</div>

          {!loading && stats && (
            <>
              <MethodTabs active={tpvMethod} onChange={setTpvMethod} />
              <div className={styles.methodDetail}>
                <span className={styles.methodValue} style={{ color: METHOD_COLORS[tpvMethod] }}>
                  {formatCurrency(stats.tpvByMethod[tpvMethod])}
                </span>
                <span className={styles.methodPct}>
                  {methodPercent(stats.tpvByMethod, tpvMethod).toFixed(1)}% do total
                </span>
              </div>
              <div className={styles.methodBar}>
                {(["pix", "card", "boleto"] as PaymentMethod[]).map((m) => (
                  <div
                    key={m}
                    className={styles.methodBarSegment}
                    style={{
                      width: `${methodPercent(stats.tpvByMethod, m)}%`,
                      background: METHOD_COLORS[m],
                      opacity: tpvMethod === m ? 1 : 0.35,
                    }}
                    title={`${METHOD_LABELS[m]}: ${methodPercent(stats.tpvByMethod, m).toFixed(1)}%`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className={`${styles.kpiCard} ${styles.kpiSecondary} ${loading ? styles.skeleton : ""}`}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Receita Líquida</span>
            <span className={`${styles.kpiIconWrap} ${styles.iconWrapTeal}`}><IconRevenue /></span>
          </div>
          <div className={styles.kpiValue}>{loading ? " " : formatCurrency(stats?.revenue || 0)}</div>
          <div className={styles.kpiMeta}>Taxas e tarifas cobradas</div>
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className={styles.secondaryGrid}>
        {/* Transações + breakdown por método */}
        <div className={`${styles.kpiCard} ${styles.kpiSm} ${loading ? styles.skeleton : ""}`}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Transações</span>
            <span className={`${styles.kpiIconWrap} ${styles.iconWrapSlate}`}><IconTransactions /></span>
          </div>
          <div className={`${styles.kpiValue} ${styles.kpiValueSm}`}>
            {loading ? " " : formatNumber(stats?.transactionsCount || 0)}
          </div>
          <div className={styles.kpiMeta}>Operações {getPeriodLabel()}</div>

          {!loading && stats && (
            <>
              <MethodTabs active={txMethod} onChange={setTxMethod} />
              <div className={styles.methodDetail}>
                <span className={styles.methodValue} style={{ color: METHOD_COLORS[txMethod], fontSize: "1.1rem" }}>
                  {formatNumber(stats.txCountByMethod[txMethod])} transações
                </span>
                <span className={styles.methodPct}>
                  {methodPercent(stats.txCountByMethod, txMethod).toFixed(1)}% do total
                </span>
              </div>
            </>
          )}
        </div>

        <div className={`${styles.kpiCard} ${styles.kpiSm} ${loading ? styles.skeleton : ""}`}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Saques Pagos</span>
            <span className={`${styles.kpiIconWrap} ${styles.iconWrapSlate}`}><IconWithdrawal /></span>
          </div>
          <div className={`${styles.kpiValue} ${styles.kpiValueSm}`}>
            {loading ? " " : formatCurrency(stats?.withdrawalsCompletedVolume || 0)}
          </div>
          <div className={styles.kpiMeta}>
            {loading ? " " : `${formatNumber(stats?.withdrawalsCompletedCount || 0)} saques aprovados`}
          </div>
        </div>

        <div className={`${styles.kpiCard} ${styles.kpiSm} ${styles.kpiCardDanger} ${loading ? styles.skeleton : ""}`}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Chargebacks</span>
            <span className={`${styles.kpiIconWrap} ${styles.iconWrapDanger}`}><IconChargeback /></span>
          </div>
          <div className={`${styles.kpiValue} ${styles.kpiValueSm} ${styles.valueDanger}`}>
            {loading ? " " : formatCurrency(stats?.chargebackVolume || 0)}
          </div>
          <div className={styles.kpiMeta}>
            {loading ? " " : `${formatNumber(stats?.chargebackCount || 0)} ocorrências`}
          </div>
        </div>

        {/* Conversão de Cartão */}
        <div className={`${styles.kpiCard} ${styles.kpiSm} ${loading ? styles.skeleton : ""}`}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Conversão de Cartão</span>
            <span className={`${styles.kpiIconWrap} ${styles.iconWrapSlate}`}><IconConversion /></span>
          </div>
          <div className={`${styles.kpiValue} ${styles.kpiValueSm} ${
            !loading && stats
              ? stats.cardConversionRate >= 80 ? styles.valueGreen
              : stats.cardConversionRate >= 60 ? styles.valueYellow
              : styles.valueDanger
              : ""
          }`}>
            {loading ? " " : `${(stats?.cardConversionRate || 0).toFixed(1)}%`}
          </div>
          <div className={styles.kpiMeta}>Aprovadas sobre total de cartão</div>
        </div>

        <div className={`${styles.kpiCard} ${styles.kpiSm} ${loading ? styles.skeleton : ""}`}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Clientes Ativos</span>
            <span className={`${styles.kpiIconWrap} ${styles.iconWrapSlate}`}><IconCustomers /></span>
          </div>
          <div className={`${styles.kpiValue} ${styles.kpiValueSm}`}>
            {loading ? " " : formatNumber(stats?.totalCustomers || 0)}
          </div>
          <div className={styles.kpiMeta}>Total cadastrado</div>
        </div>
      </div>

      {/* Rankings */}
      <div className={styles.rankingGrid}>
        {/* TOP 5 TPV — sempre mês atual vs mês anterior */}
        <div className={styles.rankingCard}>
          <div className={styles.rankingCardHeader}>
            <h2 className={styles.rankingTitle}>TOP 5 — Volume de Vendas</h2>
            <p className={styles.rankingSubtitle}>Mês atual vs mês anterior</p>
          </div>
          <div className={styles.rankingList}>
            {loading && [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`${styles.rankingSkeletonRow} ${styles.skeleton}`} />
            ))}
            {!loading && (!stats?.topTpvMonthly || stats.topTpvMonthly.length === 0) && (
              <p className={styles.noData}>Nenhum dado no período selecionado.</p>
            )}
            {!loading && stats?.topTpvMonthly.map((item, idx) => (
              <div key={idx} className={styles.rankingItem}>
                <span className={`${styles.rankPos} ${idx === 0 ? styles.rankGold : idx === 1 ? styles.rankSilver : idx === 2 ? styles.rankBronze : styles.rankDefault}`}>
                  {idx + 1}
                </span>
                <div className={styles.rankInfo}>
                  <div className={styles.rankRow}>
                    <span className={styles.rankName}>{item.name}</span>
                    <div className={styles.rankValueGroup}>
                      <span className={styles.rankValue}>{formatCurrency(item.currentValue)}</span>
                      <span className={`${styles.rankTrend} ${item.trend >= 0 ? styles.rankTrendUp : styles.rankTrendDown}`}>
                        {item.trend >= 0 ? "▲" : "▼"} {Math.abs(item.trend).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className={styles.rankPrevRow}>
                    <span className={styles.rankPrevLabel}>Mês anterior:</span>
                    <span className={styles.rankPrevValue}>{formatCurrency(item.prevValue)}</span>
                  </div>
                  <div className={styles.rankBar}>
                    <div className={styles.rankBarFill} style={{ width: `${(item.currentValue / (stats.topTpvMonthly[0]?.currentValue || 1)) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TOP 5 Maior Receita — últimos 30 dias */}
        <div className={styles.rankingCard}>
          <div className={styles.rankingCardHeader}>
            <h2 className={styles.rankingTitle}>TOP 5 — Maior Receita</h2>
            <p className={styles.rankingSubtitle}>Clientes com maior receita gerada nos últimos 30 dias</p>
          </div>
          <div className={styles.rankingList}>
            {loading && [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`${styles.rankingSkeletonRow} ${styles.skeleton}`} />
            ))}
            {!loading && (!stats?.topRevenue || stats.topRevenue.length === 0) && (
              <p className={styles.noData}>Nenhum dado nos últimos 30 dias.</p>
            )}
            {!loading && stats?.topRevenue.map((item, idx) => (
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
                    <div className={`${styles.rankBarFill} ${styles.rankBarTeal}`} style={{ width: `${(item.value / maxRevenue) * 100}%` }} />
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
