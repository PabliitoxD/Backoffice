"use client";

import React, { useEffect, useState } from 'react';
import styles from '../financial.module.css';
import { API_URL } from '@/lib/api';

interface StatementItem {
  id: string;
  type: 'TRANSACTION' | 'WITHDRAWAL';
  description: string;
  producerName: string;
  amount: number;
  fee: number;
  impact: number;
  status: string;
  date: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

import { useRouter } from 'next/navigation';

export default function StatementPage() {
  const router = useRouter();
  const [statement, setStatement] = useState<StatementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'WITHDRAWALS' | 'CHARGEBACKS'>('ALL');

  useEffect(() => {
    // In a real scenario, you would fetch this with authorization headers
    // Using a mocked version until integration is fully wired if auth is strict, 
    // but assuming auth is handled or we use a token from cookies/localStorage
    const fetchStatement = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/financial/statement`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setStatement(data);
        } else {
          console.error("Failed to fetch statement");
          // Mock data for preview if backend isn't reachable yet
          setStatement([
            { id: 'tx-1234', type: 'TRANSACTION', description: 'Venda (#1234)', producerName: 'Acme Corp', amount: 997.0, fee: 0, impact: 997.0, status: 'APPROVED', date: new Date().toISOString() },
            { id: 'wt-5678', type: 'WITHDRAWAL', description: 'Saque Solicitado', producerName: 'Acme Corp', amount: 500.0, fee: 5.0, impact: -505.0, status: 'COMPLETED', date: new Date(Date.now() - 86400000).toISOString() },
            { id: 'tx-9101', type: 'TRANSACTION', description: 'Venda (#9101)', producerName: 'Tech Solutions', amount: 297.0, fee: 0, impact: -297.0, status: 'CHARGEBACK', date: new Date(Date.now() - 172800000).toISOString() },
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatement();
  }, []);

  const totalIn = statement.filter(s => s.impact > 0).reduce((acc, curr) => acc + curr.impact, 0);
  const totalOut = statement.filter(s => s.impact < 0).reduce((acc, curr) => acc + Math.abs(curr.impact), 0);

  const filteredStatement = statement.filter(item => {
    if (activeTab === 'WITHDRAWALS') return item.type === 'WITHDRAWAL';
    if (activeTab === 'CHARGEBACKS') return item.status === 'CHARGEBACK';
    return true; // ALL
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <h1 className="title" style={{ fontSize: '1.8rem', fontWeight: 700 }}>Extrato Geral</h1>
        </div>
      </div>
      <p style={{ color: 'var(--text-muted)' }}>Acompanhe todas as movimentações financeiras da plataforma (Vendas, Saques e Estornos).</p>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Entradas (Aprovadas)</h3>
          <div className={`${styles.statValue} ${styles.statPositive}`}>
            {formatCurrency(totalIn)}
          </div>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Saídas (Saques / Chargebacks)</h3>
          <div className={`${styles.statValue} ${styles.statNegative}`}>
            {formatCurrency(totalOut)}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button 
          onClick={() => setActiveTab('ALL')}
          style={{ padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', border: activeTab === 'ALL' ? '2px solid var(--text-main)' : '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
        >
          Todas as Movimentações
        </button>
        <button 
          onClick={() => setActiveTab('WITHDRAWALS')}
          style={{ padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', border: activeTab === 'WITHDRAWALS' ? '2px solid var(--text-main)' : '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
        >
          Apenas Saques
        </button>
        <button 
          onClick={() => setActiveTab('CHARGEBACKS')}
          style={{ padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', border: activeTab === 'CHARGEBACKS' ? '2px solid var(--text-main)' : '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
        >
          Apenas Chargebacks
        </button>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableToolbar}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Linha do Tempo</h2>
          <select style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)' }}>
            <option value="ALL">Todo o período</option>
            <option value="30D">Últimos 30 dias</option>
            <option value="7D">Últimos 7 dias</option>
          </select>
        </div>
        
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição / Produtor</th>
                <th>Tipo</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Valor Bruto</th>
                <th style={{ textAlign: 'right' }}>Tarifa</th>
                <th style={{ textAlign: 'right' }}>Impacto no Saldo</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className={styles.emptyState}>Carregando extrato...</td></tr>
              ) : filteredStatement.length === 0 ? (
                <tr><td colSpan={8} className={styles.emptyState}>Nenhuma movimentação encontrada para este filtro.</td></tr>
              ) : (
                filteredStatement.map((item) => {
                  const isPositive = item.impact > 0;
                  const isNegative = item.impact < 0;
                  const impactColor = isPositive ? '#10b981' : isNegative ? '#ef4444' : 'var(--text-muted)';
                  const impactSign = isPositive ? '+' : '';

                  let typeBadgeClass = styles.badgeInfo;
                  if (item.type === 'WITHDRAWAL') typeBadgeClass = styles.badgeWarning;
                  if (item.status === 'CHARGEBACK') typeBadgeClass = styles.badgeDebit;

                  return (
                    <tr key={item.id}>
                      <td className={styles.textMuted}>{new Date(item.date).toLocaleString('pt-BR')}</td>
                      <td>
                        <div className={styles.fontWeightMedium}>{item.description}</div>
                        <div className={styles.textMuted} style={{ fontSize: '0.8rem' }}>{item.producerName}</div>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${typeBadgeClass}`}>
                          {item.type === 'TRANSACTION' ? 'Venda' : 'Saque'}
                        </span>
                      </td>
                      <td className={styles.textMuted}>{item.status}</td>
                      <td style={{ textAlign: 'right' }} className={styles.textMuted}>{formatCurrency(item.amount)}</td>
                      <td style={{ textAlign: 'right' }} className={styles.textMuted}>{item.fee > 0 ? formatCurrency(item.fee) : '-'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: impactColor }}>
                        {impactSign}{formatCurrency(item.impact)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          className={styles.btnAction}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                          onClick={() => {
                            if (item.type === 'WITHDRAWAL') {
                              router.push('/financial/withdrawals');
                            } else if (item.status === 'CHARGEBACK') {
                              router.push('/financial/chargebacks');
                            } else {
                              router.push('/transactions');
                            }
                          }}
                        >
                          Detalhes
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
