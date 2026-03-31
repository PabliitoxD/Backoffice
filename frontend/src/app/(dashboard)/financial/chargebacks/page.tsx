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
  const [selectedChargeback, setSelectedChargeback] = useState<any | null>(null);
  const [observation, setObservation] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
        // Mock data with diverse brands and chargeback dates for demo
        const now = new Date();
        setChargebacks([
          { 
            id: 'tx-5544', 
            amount: 129.9, 
            status: 'CHARGEBACK', 
            method: 'Cartão de Crédito', 
            cardBrand: 'Visa',
            producer: { name: 'Acme Corp' }, 
            product: { name: 'Curso Avançado' }, 
            customer: { name: 'João Comprador' }, 
            createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            chargebackAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            chargebackObservation: 'Cliente alega fraude.'
          },
          { 
            id: 'tx-9988', 
            amount: 450.0, 
            status: 'CHARGEBACK', 
            method: 'Cartão de Crédito', 
            cardBrand: 'MasterCard',
            producer: { name: 'Tech Solutions' }, 
            product: { name: 'Mentoria Expert' }, 
            customer: { name: 'Maria Silva' }, 
            createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            chargebackAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]);
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateObservation = async () => {
    if (!selectedChargeback) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/transactions/${selectedChargeback.id}/chargeback/observation`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ observation })
      });
      if (res.ok) {
        fetchChargebacks();
        setSelectedChargeback(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const calculateRemainingDays = (chargebackAt: string) => {
    const regDate = new Date(chargebackAt);
    const now = new Date();
    const diffTime = (regDate.getTime() + 5 * 24 * 60 * 60 * 1000) - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
                <th>Data Venda</th>
                <th>Registro</th>
                <th>ID</th>
                <th>Cliente</th>
                <th>Produto / Produtor</th>
                <th>Meio de Pagamento</th>
                <th style={{ textAlign: 'right' }}>Valor</th>
                <th>Notificação</th>
                <th>Prazo</th>
                <th style={{ textAlign: 'center' }}>Obs</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr><td colSpan={7} className={styles.emptyState}>Carregando contestações...</td></tr>
              ) : chargebacks.length === 0 ? (
                 <tr><td colSpan={7} className={styles.emptyState}>Nenhuma contestação de chargeback encontrada. Maravilha! 🎉</td></tr>
              ) : (
                chargebacks.map((item) => {
                  return (
                    <tr 
                      key={item.id} 
                      style={{ 
                        fontSize: '0.85rem',
                        cursor: 'default'
                      }}
                    >
                      <td className={styles.textMuted}>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</td>
                      <td className={styles.fontWeightMedium} style={{ color: 'var(--text-main)' }}>
                        {item.chargebackAt ? new Date(item.chargebackAt).toLocaleDateString('pt-BR') : 'Aguardando...'}
                      </td>
                      <td className={styles.textMuted}>#{item.id.slice(0, 8)}</td>
                      <td className={styles.fontWeightMedium}>{item.customer?.name}</td>
                      <td>
                        <div className={styles.fontWeightMedium} style={{ fontSize: '0.85rem' }}>{item.product?.name}</div>
                        <div className={styles.textMuted} style={{ fontSize: '0.75rem' }}>{item.producer?.name}</div>
                      </td>
                      <td>
                        <div className={styles.fontWeightMedium}>{item.method}</div>
                        <div className={styles.textMuted} style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4f46e5' }}>
                          {item.cardBrand || 'N/A'}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#ef4444', whiteSpace: 'nowrap' }}>-{formatCurrency(item.amount)}</td>
                      <td>
                        <span className={`${styles.badge} ${styles.badgeDebit}`} style={{ fontSize: '0.7rem', padding: '0.15rem 0.6rem' }}>
                          Disputa Aberta
                        </span>
                      </td>
                      <td>
                        {item.chargebackAt && (
                          <span style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 700, 
                            color: calculateRemainingDays(item.chargebackAt) <= 1 ? '#dc2626' : '#64748b',
                            backgroundColor: calculateRemainingDays(item.chargebackAt) <= 1 ? '#fee2e2' : 'var(--bg-secondary)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            border: calculateRemainingDays(item.chargebackAt) <= 1 ? '1px solid #fca5a5' : '1px solid var(--border-color)'
                          }}>
                            {calculateRemainingDays(item.chargebackAt) > 0 
                              ? `${calculateRemainingDays(item.chargebackAt)} dias` 
                              : 'Expirado'}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedChargeback(item);
                            setObservation(item.chargebackObservation || '');
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 800 }}
                          title="Ver/Editar Observações"
                        >
                          ...
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

      {selectedChargeback && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <div style={{ backgroundColor: 'var(--surface)', color: 'var(--text-main)', padding: '2rem', borderRadius: '8px', width: '450px', maxWidth: '90%', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Observações do Chargeback</h3>
              <button onClick={() => setSelectedChargeback(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Transação</div>
              <div style={{ fontWeight: 600 }}>#{selectedChargeback.id.slice(0, 8)} - {selectedChargeback.customer?.name}</div>
            </div>

            <textarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Digite observações sobre a defesa ou status deste chargeback..."
              rows={6}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--background)', color: 'var(--text-main)', fontSize: '0.95rem', resize: 'vertical' }}
            />
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setSelectedChargeback(null)}
                style={{ padding: '0.65rem 1.25rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'none', cursor: 'pointer', color: 'var(--text-main)' }}
              >
                Fechar
              </button>
              <button 
                onClick={handleUpdateObservation}
                disabled={isSaving}
                style={{ padding: '0.65rem 1.25rem', borderRadius: '6px', background: '#4f46e5', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, opacity: isSaving ? 0.7 : 1 }}
              >
                {isSaving ? 'Salvando...' : 'Salvar Observação'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
