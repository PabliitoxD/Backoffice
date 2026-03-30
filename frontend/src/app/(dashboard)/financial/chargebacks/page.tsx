"use client";

import React, { useEffect, useState } from 'react';
import styles from '../financial.module.css';
import { API_URL } from '@/lib/api';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function ChargebacksPage() {
  const [chargebacks, setChargebacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChargebacks = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch specifically transactions with status CHARGEBACK
      const res = await fetch(`${API_URL}/transactions?status=CHARGEBACK`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChargebacks(data);
      } else {
        // Mock data
        setChargebacks([
          { id: 'tx-5544', amount: 129.9, status: 'CHARGEBACK', method: 'Cartão de Crédito', producer: { name: 'Acme Corp' }, product: { name: 'Curso Avançado' }, customer: { name: 'João Comprador' }, createdAt: new Date().toISOString() }
        ]);
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChargebacks();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <h1 className="title" style={{ fontSize: '1.8rem', fontWeight: 700, color: '#dc2626' }}>Painel de Chargebacks</h1>
        </div>
      </div>
      <p style={{ color: 'var(--text-muted)' }}>Módulo integrado com a Adquirente. Vendas contestadas pelos titulares de cartões de crédito.</p>

      <div className={styles.tableCard} style={{ borderTop: '4px solid #ef4444' }}>
        <div className={styles.tableToolbar}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Contestações Ativas</h2>
        </div>
        
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data da Venda</th>
                <th>ID Transação</th>
                <th>Cliente</th>
                <th>Produto / Produtor</th>
                <th>Meio de Pagamento</th>
                <th style={{ textAlign: 'right' }}>Valor a Descontar</th>
                <th>Notificação do Bancária</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr><td colSpan={7} className={styles.emptyState}>Carregando contestações...</td></tr>
              ) : chargebacks.length === 0 ? (
                 <tr><td colSpan={7} className={styles.emptyState}>Nenhuma contestação de chargeback encontrada. Maravilha! 🎉</td></tr>
              ) : (
                chargebacks.map((item) => (
                   <tr key={item.id}>
                    <td className={styles.textMuted}>{new Date(item.createdAt).toLocaleString('pt-BR')}</td>
                    <td className={styles.fontWeightMedium}>#{item.id.slice(0, 8)}</td>
                    <td>{item.customer?.name}</td>
                    <td>
                      <div className={styles.fontWeightMedium}>{item.product?.name}</div>
                      <div className={styles.textMuted} style={{ fontSize: '0.8rem' }}>{item.producer?.name}</div>
                    </td>
                    <td className={styles.textMuted}>{item.method}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#ef4444' }}>-{formatCurrency(item.amount)}</td>
                    <td>
                      <span className={`${styles.badge} ${styles.badgeDebit}`}>
                        Disputa Aberta
                      </span>
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
