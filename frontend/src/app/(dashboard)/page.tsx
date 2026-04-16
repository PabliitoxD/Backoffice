"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { API_URL } from "@/lib/api";

interface DashboardStats {
  totalVolume: number;
  monthVolume: number;
  activeProducers: number;
  totalCustomers: number;
  monthCustomers: number;
  pendingWithdrawalsVolume: number;
  pendingWithdrawalsCount: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/financial/dashboard-summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Falha ao carregar estatísticas");

        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        console.error("Dashboard error:", err);
        setError("Não foi possível carregar os dados reais.");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const STATS_CARDS = [
    { 
      title: "Volume Total", 
      value: loading ? "..." : formatCurrency(stats?.totalVolume || 0), 
      trend: "Acumulado", 
      isPositive: true 
    },
    { 
      title: "Vendas (Este Mês)", 
      value: loading ? "..." : formatCurrency(stats?.monthVolume || 0), 
      trend: "Mês atual", 
      isPositive: true 
    },
    { 
      title: "Produtores Ativos", 
      value: loading ? "..." : (stats?.activeProducers || 0).toString(), 
      trend: "Verificados", 
      isPositive: true 
    },
    { 
      title: "Novos Clientes", 
      value: loading ? "..." : (stats?.monthCustomers || 0).toString(), 
      trend: "Novos este mês", 
      isPositive: true 
    },
    { 
      title: "Saques Pendentes", 
      value: loading ? "..." : formatCurrency(stats?.pendingWithdrawalsVolume || 0), 
      trend: `${stats?.pendingWithdrawalsCount || 0} solicitações`, 
      isPositive: false 
    },
    { 
      title: "Base de Clientes", 
      value: loading ? "..." : (stats?.totalCustomers || 0).toString(), 
      trend: "Total histórico", 
      isPositive: true 
    },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className="title">Dashboard Financeiro</h1>
        <p className="subtitle">Visão geral do sistema de pagamentos e produtores.</p>
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
              <h2 className="title">Instruções de Ajuste</h2>
              <p className="subtitle">Dica: Utilize os blocos acima para verificar o alinhamento visual.</p>
            </div>
          </div>
          <div className={styles.placeholderContent}>
            <p>Os dados estão sendo carregados em tempo real do banco de dados.</p>
            <p>Se você vir valores zerados, certifique-se de que os seeds foram executados corretamente.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
