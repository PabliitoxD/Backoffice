"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function StatementPage() {
  const router = useRouter();
  const [statement, setStatement] = useState<StatementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'VENDAS' | 'WITHDRAWALS' | 'CHARGEBACKS'>('ALL');

  useEffect(() => {
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
    if (activeTab === 'VENDAS') return item.type === 'TRANSACTION' && item.impact > 0;
    if (activeTab === 'WITHDRAWALS') return item.type === 'WITHDRAWAL';
    if (activeTab === 'CHARGEBACKS') return item.type === 'TRANSACTION' && item.impact < 0; 
    return true; 
  });

  const filteredBalance = filteredStatement.reduce((acc, curr) => acc + curr.impact, 0);

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
          <h3 className={styles.statTitle}>Entradas</h3>
          <div className={`${styles.statValue} ${styles.statPositive}`}>
            {formatCurrency(totalIn)}
          </div>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Saídas</h3>
          <div className={`${styles.statValue} ${styles.statNegative}`}>
            {formatCurrency(totalOut)}
          </div>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableToolbar}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Linha do Tempo</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <select 
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', outline: 'none' }}
            >
              <option value="ALL">Filtro: Todas as Movimentações</option>
              <option value="VENDAS">Vendas (+)</option>
              <option value="WITHDRAWALS">Saques Solicitados (-)</option>
              <option value="CHARGEBACKS">Chargebacks e Estornos (-)</option>
            </select>
          </div>
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
            {filteredStatement.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={6} style={{ textAlign: 'right', fontWeight: 600, padding: '1rem 1.5rem', borderTop: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    Saldo Consolidado (Filtro Atual):
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, padding: '1rem 1.5rem', borderTop: '2px solid var(--border-color)', color: filteredBalance >= 0 ? '#10b981' : '#ef4444', fontSize: '1.1rem' }}>
                    {filteredBalance >= 0 ? '+' : ''}{formatCurrency(filteredBalance)}
                  </td>
                  <td style={{ borderTop: '2px solid var(--border-color)' }}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
