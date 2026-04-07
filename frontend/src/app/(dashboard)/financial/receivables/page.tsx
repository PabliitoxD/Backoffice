"use client";

import React, { useEffect, useState } from 'react';
import styles from '../financial.module.css';
import { API_URL } from '@/lib/api';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function ReceivablesPage() {
  const [receivables, setReceivables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchReceivables = async () => {
    setLoading(true);
    try {
      // API call to the future Receivables endpoint. Currently mocking due to pending backend implementation.
      const token = localStorage.getItem('token');
      // const res = await fetch(`${API_URL}/receivables`);
      
      const now = new Date();
      const mockReceivables = [
        {
          id: 'rv-1001',
          transactionId: 'tx-5544',
          transaction: {
            method: 'PIX',
            cardBrand: null,
            amount: 1500.0,
            customer: { name: 'João Silva' }
          },
          installment: 1,
          totalInstallments: 1,
          amount: 1485.0, // After fees
          status: 'AVAILABLE',
          expectedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'rv-1002',
          transactionId: 'tx-2233',
          transaction: {
            method: 'Cartão de Crédito',
            cardBrand: 'MasterCard',
            amount: 900.0,
            customer: { name: 'Maria Souza' }
          },
          installment: 1,
          totalInstallments: 3,
          amount: 285.0,
          status: 'AVAILABLE',
          expectedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'rv-1003',
          transactionId: 'tx-2233',
          transaction: {
            method: 'Cartão de Crédito',
            cardBrand: 'MasterCard',
            amount: 900.0,
            customer: { name: 'Maria Souza' }
          },
          installment: 2,
          totalInstallments: 3,
          amount: 285.0,
          status: 'WAITING_FUNDS',
          expectedAt: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'rv-1004',
          transactionId: 'tx-2233',
          transaction: {
            method: 'Cartão de Crédito',
            cardBrand: 'MasterCard',
            amount: 900.0,
            customer: { name: 'Maria Souza' }
          },
          installment: 3,
          totalInstallments: 3,
          amount: 285.0,
          status: 'WAITING_FUNDS',
          expectedAt: new Date(now.getTime() + 55 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'rv-1005',
          transactionId: 'tx-8899',
          transaction: {
            method: 'Boleto',
            cardBrand: null,
            amount: 350.0,
            customer: { name: 'Carlos Santos' }
          },
          installment: 1,
          totalInstallments: 1,
          amount: 345.0,
          status: 'WAITING_FUNDS',
          expectedAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), // D+2 Example (created yesterday, expected tomorrow)
          createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ];

      setReceivables(mockReceivables);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceivables();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className={`${styles.badge} ${styles.badgeCredit}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>Liberado</span>;
      case 'WAITING_FUNDS':
        return <span className={`${styles.badge}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', backgroundColor: '#f59e0b', color: '#fff' }}>Aguardando Liberação</span>;
      case 'PAID':
        return <span className={`${styles.badge}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', backgroundColor: '#3b82f6', color: '#fff' }}>Transferido</span>;
      default:
        return <span className={styles.badge}>{status}</span>;
    }
  };

  const filteredReceivables = receivables.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        item.transactionId.toLowerCase().includes(search) ||
        item.transaction.customer.name.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const totalWaiting = receivables.filter(r => r.status === 'WAITING_FUNDS').reduce((acc, curr) => acc + curr.amount, 0);
  const totalAvailable = receivables.filter(r => r.status === 'AVAILABLE').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <h1 className="title" style={{ fontSize: '1.8rem', fontWeight: 700, color: '#10b981' }}>Recebíveis (Lançamentos Futuros)</h1>
        </div>
      </div>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Lista detalhada das parcelas e valores líquidos vinculados às vendas que compõem seu saldo.</p>

      {/* DASHBOARD CARDS FOR RECEIVABLES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Aguardando Liberação (Futuro)</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f59e0b' }}>{formatCurrency(totalWaiting)}</span>
        </div>
        <div style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Saldo Liberado</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#10b981' }}>{formatCurrency(totalAvailable)}</span>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableToolbar} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Parcelas e Recebimentos</h2>
          
          <div style={{ display: 'flex', gap: '0.75rem', flex: 1, justifyContent: 'flex-end', minWidth: '300px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '250px' }}>
              <input 
                type="text" 
                placeholder="ID Venda, Cliente..." 
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--background)', color: 'var(--text-main)', fontSize: '0.85rem' }}
              />
              <span style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
            </div>

            <select 
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--background)', color: 'var(--text-main)', minWidth: '150px', fontSize: '0.85rem' }}
            >
              <option value="all">Todas</option>
              <option value="WAITING_FUNDS">Aguardando Liberação</option>
              <option value="AVAILABLE">Liberado</option>
            </select>
          </div>
        </div>
        
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data da Venda</th>
                <th>ID Transação</th>
                <th>Cliente</th>
                <th>Método</th>
                <th>Parcela</th>
                <th>Previsão de Liberação</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Valor Líquido</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr><td colSpan={8} className={styles.emptyState}>Calculando recebíveis...</td></tr>
              ) : filteredReceivables.length === 0 ? (
                 <tr><td colSpan={8} className={styles.emptyState}>Nenhum recebível futuro encontrado.</td></tr>
              ) : (
                filteredReceivables.map((item) => (
                  <tr key={item.id} style={{ fontSize: '0.85rem' }}>
                    <td className={styles.textMuted}>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className={styles.textMuted}>#{item.transactionId.slice(0, 8)}</td>
                    <td className={styles.fontWeightMedium}>{item.transaction.customer?.name}</td>
                    <td>
                      <div className={styles.fontWeightMedium}>{item.transaction.method}</div>
                      {item.transaction.cardBrand && (
                        <div className={styles.textMuted} style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4f46e5' }}>
                          {item.transaction.cardBrand}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                      {item.installment} / {item.totalInstallments}
                    </td>
                    <td className={styles.fontWeightMedium} style={{ color: item.status === 'WAITING_FUNDS' ? 'var(--text-main)' : 'var(--text-muted)' }}>
                      {new Date(item.expectedAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#10b981', whiteSpace: 'nowrap' }}>
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
