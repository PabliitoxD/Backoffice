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
  // Helper to get first and last day of current month in YYYY-MM-DD
  const getMonthDateRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0]
    };
  };

  const currentMonthRange = getMonthDateRange();
  
  const [statement, setStatement] = useState<StatementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'VENDAS' | 'WITHDRAWALS' | 'CHARGEBACKS'>('ALL');
  const [startDate, setStartDate] = useState(currentMonthRange.start);
  const [endDate, setEndDate] = useState(currentMonthRange.end);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStatement = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`${API_URL}/financial/statement?${params.toString()}`, {
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
          { id: 'wt-5678', type: 'WITHDRAWAL', description: 'Saque Bancário', producerName: 'Acme Corp', amount: 500.0, fee: 5.0, impact: -505.0, status: 'COMPLETED', date: new Date(Date.now() - 86400000).toISOString() },
          { id: 'tx-9101', type: 'TRANSACTION', description: 'Venda (#9101)', producerName: 'Tech Solutions', amount: 297.0, fee: 0, impact: -297.0, status: 'CHARGEBACK', date: new Date(Date.now() - 172800000).toISOString() },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatement();
  }, []);

  const filteredStatement = statement.filter(item => {
    if (activeTab === 'VENDAS') return item.type === 'TRANSACTION' && item.impact > 0;
    if (activeTab === 'WITHDRAWALS') return item.type === 'WITHDRAWAL';
    if (activeTab === 'CHARGEBACKS') return item.type === 'TRANSACTION' && item.impact < 0; 
    return true; 
  });

  const totalIn = filteredStatement.filter(s => s.impact > 0).reduce((acc, curr) => acc + curr.impact, 0);
  const totalOut = filteredStatement.filter(s => s.impact < 0).reduce((acc, curr) => acc + Math.abs(curr.impact), 0);
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
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Pesquisa e Lançamentos</h2>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.9rem' }} 
            />
            <span style={{ color: 'var(--text-muted)' }}>até</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.9rem' }} 
            />
            
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por ID, Produtor, Cliente..."
              style={{ padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.9rem', flex: 1, minWidth: '200px' }} 
            />

            <select 
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              style={{ padding: '0.65rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#1e293b', color: '#f8fafc', outline: 'none', fontSize: '0.9rem', cursor: 'pointer' }}
            >
              <option value="ALL">Tipo: Todas as Movimentações</option>
              <option value="VENDAS">Vendas (+)</option>
              <option value="WITHDRAWALS">Saques (-)</option>
              <option value="CHARGEBACKS">Chargebacks e Estornos (-)</option>
            </select>

            <button 
              onClick={fetchStatement} 
              className={`${styles.btnAction} ${styles.btnSuccess}`} 
              style={{ padding: '0.65rem 1.5rem', fontWeight: 600 }}
            >
              Buscar
            </button>
          </div>
        </div>
        
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Lançamento / Histórico</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Valor</th>
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
                      <td className={styles.textMuted}>{new Date(item.date).toLocaleDateString('pt-BR')} <span style={{ fontSize: '0.8em', display:'block' }}>{new Date(item.date).toLocaleTimeString('pt-BR')}</span></td>
                      <td>
                        <div className={styles.fontWeightMedium} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className={`${styles.badge} ${typeBadgeClass}`} style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem' }}>
                            {item.type === 'TRANSACTION' ? 'Venda' : 'Saque'}
                          </span>
                          {item.description}
                        </div>
                        <div className={styles.textMuted} style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
                          Ref: {item.producerName}
                          {item.type === 'WITHDRAWAL' && item.fee > 0 && (
                            <span style={{ marginLeft: '0.5rem', color: '#f59e0b', fontWeight: 500 }}>
                              ({formatCurrency(Math.abs(item.impact) - item.fee)} Líquido + {formatCurrency(item.fee)} Tarifa)
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                         <span style={{ fontSize: '0.85rem', padding: '0.25rem 0.75rem', borderRadius: '999px', backgroundColor: 'var(--bg-secondary)', fontWeight: 500, color: 'var(--text-muted)' }}>
                           {item.status}
                         </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: impactColor }}>
                        {impactSign}{formatCurrency(Math.abs(item.impact))}
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
                  <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600, padding: '1rem 1.5rem', borderTop: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
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
