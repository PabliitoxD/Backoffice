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
  const [searchTerm, setSearchTerm] = useState('');
  const [deadlineFilter, setDeadlineFilter] = useState('all');
  
  const [extraChargeAmount, setExtraChargeAmount] = useState('');
  const [extraChargeReason, setExtraChargeReason] = useState('');
  const [isCharging, setIsCharging] = useState(false);
  
  // Current month default dates
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  const fetchChargebacks = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      queryParams.append('status', 'CHARGEBACK');
      if (searchTerm) queryParams.append('search', searchTerm);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      
      const fetchUrl = `${API_URL}/transactions?${queryParams.toString()}`;
      
      try {
        const res = await fetch(fetchUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const responseData = await res.json();
        if (Array.isArray(responseData)) {
          setChargebacks(responseData);
        } else {
          setChargebacks([]);
        }
      } catch (err) {
        setChargebacks([]);
      }
    } catch(e) {
      console.error(e);
      setChargebacks([]);
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

  const handleLaunchExtraCharge = async () => {
    if (!selectedChargeback || !extraChargeAmount || !extraChargeReason) return;
    setIsCharging(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/transactions/${selectedChargeback.id}/extra-charge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(extraChargeAmount),
          reason: extraChargeReason
        })
      });
      if (res.ok) {
        alert('Cobrança extra lançada com sucesso no extrato!');
        setExtraChargeAmount('');
        setExtraChargeReason('');
        setSelectedChargeback(null);
        fetchChargebacks();
      } else {
        alert('Erro ao lançar cobrança extra.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCharging(false);
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
    const timer = setTimeout(() => {
      fetchChargebacks();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, startDate, endDate]);

  const filteredChargebacks = chargebacks.filter(item => {
    if (deadlineFilter === 'all') return true;
    if (!item.chargebackAt) return true;
    const days = calculateRemainingDays(item.chargebackAt);
    if (deadlineFilter === 'critical') return days > 0 && days <= 1;
    if (deadlineFilter === 'alert') return days >= 2 && days <= 3;
    if (deadlineFilter === 'regular') return days > 3;
    if (deadlineFilter === 'expired') return days <= 0;
    return true;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <h1 className="title" style={{ fontSize: '1.8rem', fontWeight: 700, color: '#dc2626' }}>Painel de Chargebacks</h1>
        </div>
      </div>
      <p style={{ color: 'var(--text-muted)' }}>Módulo integrado com a Adquirente. Vendas contestadas pelos titulares de cartões de crédito.</p>

      <div className={styles.tableCard} style={{ borderTop: '4px solid #ef4444' }}>
        <div className={styles.tableToolbar} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Contestações Ativas</h2>
          
          <div style={{ display: 'flex', gap: '0.75rem', flex: 1, justifyContent: 'flex-end', minWidth: '300px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: 'var(--background)', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                style={{ background: 'none', border: 'none', fontSize: '0.85rem', color: 'var(--text-main)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>até</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                style={{ background: 'none', border: 'none', fontSize: '0.85rem', color: 'var(--text-main)', cursor: 'pointer' }}
              />
            </div>

            <div style={{ position: 'relative', flex: 1, maxWidth: '250px' }}>
              <input 
                type="text" 
                placeholder="ID, Cliente, Produtor..." 
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--background)', color: 'var(--text-main)', fontSize: '0.85rem' }}
              />
              <span style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
            </div>

            <select 
              className={styles.filterSelect}
              value={deadlineFilter}
              onChange={(e) => setDeadlineFilter(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--background)', color: 'var(--text-main)', minWidth: '150px', fontSize: '0.85rem' }}
            >
              <option value="all">Filtro: Prazo</option>
              <option value="critical">Crítico (≤ 1 dia)</option>
              <option value="alert">Alerta (2-3 dias)</option>
              <option value="regular">Regular (&gt; 3 dias)</option>
              <option value="expired">Expirado</option>
            </select>
          </div>
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
                 <tr><td colSpan={10} className={styles.emptyState}>Carregando contestações...</td></tr>
              ) : filteredChargebacks.length === 0 ? (
                 <tr><td colSpan={10} className={styles.emptyState}>Nenhuma contestação encontrada para os filtros aplicados.</td></tr>
              ) : (
                filteredChargebacks.map((item) => {
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
                        <span className={`${styles.badge} ${item.chargebackAt && calculateRemainingDays(item.chargebackAt) <= 0 ? styles.badgeSecondary : styles.badgeDebit}`} style={{ fontSize: '0.7rem', padding: '0.15rem 0.6rem', backgroundColor: item.chargebackAt && calculateRemainingDays(item.chargebackAt) <= 0 ? '#64748b' : undefined, color: item.chargebackAt && calculateRemainingDays(item.chargebackAt) <= 0 ? '#ffffff' : undefined }}>
                          {item.chargebackAt && calculateRemainingDays(item.chargebackAt) <= 0 ? 'Disputa Encerrada' : 'Disputa Aberta'}
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

            {selectedChargeback.chargebackAt && calculateRemainingDays(selectedChargeback.chargebackAt) <= 0 && (
               <div style={{ 
                 marginTop: '2rem', 
                 padding: '1.5rem', 
                 backgroundColor: 'rgba(239, 68, 68, 0.1)',
                 borderRadius: '8px',
                 border: '1px solid #ef4444'
               }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                   <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                   <h4 style={{ margin: 0, color: '#ef4444', fontSize: '1rem', fontWeight: 700 }}>Disputa Encerrada - Lançar Cobrança Extra</h4>
                 </div>
                 <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                   Caso deseje repassar um custo extra, preencha os dados abaixo. O valor entrará como crédito no seu extrato e débito para o cliente.
                 </p>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>Valor da cobrança (ex: 50.00)</label>
                      <input 
                        type="number" 
                        placeholder="0.00" 
                        value={extraChargeAmount}
                        onChange={e => setExtraChargeAmount(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--background)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>Motivo da cobrança</label>
                      <input 
                        type="text" 
                        placeholder="Descreva o motivo..." 
                        value={extraChargeReason}
                        onChange={e => setExtraChargeReason(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--background)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
                      />
                    </div>
                    <button 
                      onClick={handleLaunchExtraCharge}
                      disabled={isCharging || !extraChargeAmount || !extraChargeReason}
                      style={{ 
                        marginTop: '0.5rem', 
                        padding: '0.75rem', 
                        borderRadius: '6px', 
                        background: '#10b981', 
                        color: 'white', 
                        border: 'none', 
                        cursor: 'pointer', 
                        fontWeight: 700, 
                        fontSize: '0.9rem',
                        transition: 'opacity 0.2s',
                        opacity: (isCharging || !extraChargeAmount || !extraChargeReason) ? 0.5 : 1 
                      }}
                    >
                      {isCharging ? 'Processando...' : 'Lançar Cobrança no Extrato'}
                    </button>
                 </div>
               </div>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
}
