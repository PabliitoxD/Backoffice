"use client";

import DashboardCard, { ListItem } from "./DashboardCard";
import styles from "./DashboardStatsGrid.module.css";

interface Props {
  data: any;
}

export default function DashboardStatsGrid({ data }: Props) {
  if (!data || !data.current) return null;

  const { current, previous } = data;

  const calculateDelta = (curr: number, prev: number) => {
    if (prev === 0) return curr === 0 ? 0 : 100;
    return ((curr - prev) / prev) * 100;
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className={styles.grid}>
      {/* 1. Receita */}
      <DashboardCard
        title="Receita"
        value={formatCurrency(current.revenue)}
        delta={calculateDelta(current.revenue, previous.revenue)}
      />

      {/* 2. TPV e Transações Totais */}
      <DashboardCard
        title="TPV & Transações"
        value={formatCurrency(current.tpv)}
        delta={calculateDelta(current.tpv, previous.tpv)}
        listTitle="Últimas 5 Transações"
        items={current.lastTransactions.map((t: any) => ({
          id: t.id,
          label: t.customer?.name || "Desconhecido",
          subLabel: new Date(t.createdAt).toLocaleDateString('pt-BR'),
          value: formatCurrency(t.amount)
        }))}
      />

      {/* 3. Chargeback */}
      <DashboardCard
        title="Chargeback"
        value={formatCurrency(current.chargebackValue)}
        delta={calculateDelta(current.chargebackValue, previous.chargebackValue)}
        listTitle="Últimos 5 Chargebacks"
        items={current.chargebacks.map((c: any) => ({
          id: c.id,
          label: `ID: ${c.id.slice(0,8)}`,
          subLabel: new Date(c.createdAt).toLocaleDateString('pt-BR'),
          value: formatCurrency(c.amount)
        }))}
      />

      {/* 4. Saque */}
      <DashboardCard
        title="Saques Totais"
        value={current.withdrawalCount.toString()}
        delta={calculateDelta(current.withdrawalCount, previous.withdrawalCount)}
        listTitle="Saques Processados"
        items={current.processingWithdrawals.map((w: any) => ({
           id: w.id,
           label: w.producer?.name || "Desconhecido",
           subLabel: new Date(w.createdAt).toLocaleDateString('pt-BR'),
           value: formatCurrency(w.amount)
        }))}
      />

      {/* 5. Top 5 TPV e Saques */}
      <DashboardCard
        title="Top 5 Clientes (TPV)"
        value={formatCurrency(current.topProducers[0]?.tpv || 0)}
        listTitle="Ranking e Saques"
        items={current.topProducers.map((p: any, idx: number) => ({
          id: `top-${idx}`,
          label: p.name,
          subLabel: `Saques: ${formatCurrency(p.withdrawals)}`,
          value: formatCurrency(p.tpv)
        }))}
      />
    </div>
  );
}
