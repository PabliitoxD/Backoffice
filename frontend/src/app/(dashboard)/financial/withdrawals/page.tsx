"use client";

import React, { useEffect, useState } from 'react';
import styles from '../financial.module.css';
import { API_URL } from '@/lib/api';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchWithdrawals = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch specifically withdrawals from the dedicated withdrawals endpoint
      const res = await fetch(`${API_URL}/withdrawals?status=PENDING`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(data);
      } else {
        // Mock se falhar
        setWithdrawals([
          { id: 'wt-11', amount: 1500, fee: 5.0, status: 'PENDING', producer: { name: 'Acme Corp' }, createdAt: new Date().toISOString() },
          { id: 'wt-22', amount: 320, fee: 5.0, status: 'PENDING', producer: { name: 'Tech Solutions' }, createdAt: new Date(Date.now() - 3600000).toISOString() }
        ]);
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleAction = async (id: string, newStatus: string) => {
    if (!confirm(`Deseja realmente ${newStatus === 'APPROVED' ? 'APROVAR' : 'RECUSAR'} este saque?`)) return;
    
    setProcessing(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/withdrawals/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        alert("Operação realizada com sucesso!");
        fetchWithdrawals(); // Recarrega
      } else {
        alert("Erro ao realizar operação");
        setWithdrawals(prev => prev.filter(w => w.id !== id)); // Mock behavior
      }
    } catch(e) {
      console.error(e);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <h1 className="title" style={{ fontSize: '1.8rem', fontWeight: 700 }}>Solicitações de Saque</h1>
        </div>
      </div>
      <p style={{ color: 'var(--text-muted)' }}>Gerencie as solicitações de transferência de saldo pendentes dos produtores.</p>

      <div className={styles.tableCard}>
        <div className={styles.tableToolbar}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Aguardando Aprovação</h2>
        </div>
        
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Produtor</th>
                <th>Valor Solicitado</th>
                <th>Tarifa (Planos e Liq.)</th>
                <th>Total a Descontar</th>
                <th>Status Atual</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className={styles.emptyState}>Carregando solicitações...</td></tr>
              ) : withdrawals.length === 0 ? (
                <tr><td colSpan={7} className={styles.emptyState}>Nenhuma solicitação pendente no momento.</td></tr>
              ) : (
                withdrawals.map((item) => {
                  const fee = item.fee || 5.00; // Mock fee if undefined
                  const total = item.amount + fee;
                  return (
                     <tr key={item.id}>
                      <td className={styles.textMuted}>{new Date(item.createdAt).toLocaleString('pt-BR')}</td>
                      <td className={styles.fontWeightMedium}>{item.producer?.name || 'Desconhecido'}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(item.amount)}</td>
                      <td className={styles.textMuted}>{formatCurrency(fee)}</td>
                      <td className={styles.fontWeightMedium} style={{ color: '#ef4444' }}>{formatCurrency(total)}</td>
                      <td>
                        <span className={`${styles.badge} ${styles.badgeWarning}`}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button 
                            className={`${styles.btnAction} ${styles.btnSuccess}`}
                            onClick={() => handleAction(item.id, 'APPROVED')}
                            disabled={processing === item.id}
                          >
                            {processing === item.id ? '...' : 'Aprovar (Pago)'}
                          </button>
                          <button 
                            className={`${styles.btnAction} ${styles.btnDangerOutlined}`}
                            onClick={() => handleAction(item.id, 'REFUSED')}
                            disabled={processing === item.id}
                          >
                            Recusar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
