"use client";

import React, { useEffect, useState, useRef } from 'react';
import styles from './chargebacks.module.css';
import { API_URL } from '@/lib/api';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_EXT = ['.pdf', '.doc', '.docx'];

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

  // Defense state
  const [defenseFiles, setDefenseFiles] = useState<File[]>([]);
  const [defenseDescription, setDefenseDescription] = useState('');
  const [isSubmittingDefense, setIsSubmittingDefense] = useState(false);
  const [defenseSuccess, setDefenseSuccess] = useState<string | null>(null);
  const [defenseError, setDefenseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      const res = await fetch(`${API_URL}/transactions?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const responseData = await res.json();
      setChargebacks(Array.isArray(responseData) ? responseData : []);
    } catch (err) {
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount: parseFloat(extraChargeAmount), reason: extraChargeReason })
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

  const handleAddFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const valid: File[] = [];
    const invalid: string[] = [];
    Array.from(fileList).forEach(f => {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      if (ALLOWED_EXT.includes(ext) || ALLOWED_TYPES.includes(f.type)) {
        valid.push(f);
      } else {
        invalid.push(f.name);
      }
    });
    if (invalid.length) {
      setDefenseError(`Arquivos não permitidos: ${invalid.join(', ')}. Use apenas PDF, DOC ou DOCX.`);
    } else {
      setDefenseError(null);
    }
    setDefenseFiles(prev => [...prev, ...valid]);
  };

  const handleDropFiles = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleAddFiles(e.dataTransfer.files);
  };

  const handleSubmitDefense = async () => {
    if (!selectedChargeback || !defenseDescription.trim()) {
      setDefenseError('Preencha a descrição da defesa antes de enviar.');
      return;
    }
    setIsSubmittingDefense(true);
    setDefenseError(null);
    setDefenseSuccess(null);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('description', defenseDescription);
      defenseFiles.forEach(f => formData.append('files', f));

      const res = await fetch(`${API_URL}/transactions/${selectedChargeback.id}/chargeback/defense`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setDefenseSuccess(`Defesa enviada com sucesso! Ref. Adquirente: ${data.acquirerRef}`);
        setDefenseFiles([]);
        setDefenseDescription('');
        fetchChargebacks();
      } else {
        setDefenseError(data.message || 'Erro ao enviar defesa.');
      }
    } catch (err) {
      setDefenseError('Erro de conexão ao enviar defesa.');
    } finally {
      setIsSubmittingDefense(false);
    }
  };

  const calculateRemainingDays = (chargebackAt: string) => {
    const regDate = new Date(chargebackAt);
    const now = new Date();
    const diffTime = (regDate.getTime() + 5 * 24 * 60 * 60 * 1000) - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    const timer = setTimeout(() => { fetchChargebacks(); }, 500);
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

  const openModal = (item: any) => {
    setSelectedChargeback(item);
    setObservation(item.chargebackObservation || '');
    setDefenseFiles([]);
    setDefenseDescription('');
    setDefenseSuccess(null);
    setDefenseError(null);
    setExtraChargeAmount('');
    setExtraChargeReason('');
  };

  const closeModal = () => setSelectedChargeback(null);

  const remainingDays = selectedChargeback?.chargebackAt
    ? calculateRemainingDays(selectedChargeback.chargebackAt)
    : null;
  const defenseOpen = remainingDays !== null && remainingDays > 0;

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
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ background: 'none', border: 'none', fontSize: '0.85rem', color: 'var(--text-main)', cursor: 'pointer' }} />
              <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>até</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ background: 'none', border: 'none', fontSize: '0.85rem', color: 'var(--text-main)', cursor: 'pointer' }} />
            </div>
            <div style={{ position: 'relative', flex: 1, maxWidth: '250px' }}>
              <input type="text" placeholder="ID, Cliente, Produtor..." className={styles.searchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--background)', color: 'var(--text-main)', fontSize: '0.85rem' }} />
              <span style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
            </div>
            <select className={styles.filterSelect} value={deadlineFilter} onChange={(e) => setDeadlineFilter(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--background)', color: 'var(--text-main)', minWidth: '150px', fontSize: '0.85rem' }}>
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
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className={styles.emptyState}>Carregando contestações...</td></tr>
              ) : filteredChargebacks.length === 0 ? (
                <tr><td colSpan={10} className={styles.emptyState}>Nenhuma contestação encontrada para os filtros aplicados.</td></tr>
              ) : (
                filteredChargebacks.map((item) => {
                  const days = item.chargebackAt ? calculateRemainingDays(item.chargebackAt) : null;
                  const isDefenseOpen = days !== null && days > 0;
                  return (
                    <tr key={item.id} style={{ fontSize: '0.85rem' }}>
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
                        <div className={styles.textMuted} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-color)' }}>{item.cardBrand || 'N/A'}</div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#ef4444', whiteSpace: 'nowrap' }}>-{formatCurrency(item.amount)}</td>
                      <td>
                        <span className={`${styles.badge} ${days !== null && days <= 0 ? styles.badgeSecondary : styles.badgeDebit}`} style={{ fontSize: '0.7rem', padding: '0.15rem 0.6rem', backgroundColor: days !== null && days <= 0 ? '#64748b' : undefined, color: days !== null && days <= 0 ? '#ffffff' : undefined }}>
                          {days !== null && days <= 0 ? 'Disputa Encerrada' : 'Disputa Aberta'}
                        </span>
                      </td>
                      <td>
                        {item.chargebackAt && days !== null && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: days <= 1 ? '#dc2626' : '#64748b', backgroundColor: days <= 1 ? '#fee2e2' : 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: days <= 1 ? '1px solid #fca5a5' : '1px solid var(--border-color)' }}>
                            {days > 0 ? `${days} dias` : 'Expirado'}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          {isDefenseOpen && (
                            <button
                              onClick={(e) => { e.stopPropagation(); openModal(item); }}
                              title="Enviar Defesa"
                              style={{ background: 'rgba(24, 88, 131, 0.1)', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', borderRadius: '6px', padding: '0.3rem 0.65rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              🛡️ Defesa
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); openModal(item); }}
                            title="Ver/Editar Observações"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 800 }}
                          >
                            ...
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chargeback Detail Modal */}
      {selectedChargeback && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'var(--surface)', color: 'var(--text-main)', borderRadius: '12px', width: '560px', maxWidth: '95%', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(239,68,68,0.05)', borderTop: '3px solid #ef4444' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Chargeback #{selectedChargeback.id.slice(0, 8)}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {selectedChargeback.customer?.name} • {selectedChargeback.product?.name}
                </div>
              </div>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 1 }}>×</button>
            </div>

            {/* Scrollable Body */}
            <div style={{ overflowY: 'auto', flex: 1 }}>

              {/* Defense Panel — only within 5 days */}
              {defenseOpen && (
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(24, 88, 131, 0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                        🛡️ Enviar Defesa à Adquirente
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Prazo disponível: <strong style={{ color: remainingDays! <= 1 ? '#dc2626' : 'var(--primary-color)' }}>{remainingDays} dia{remainingDays !== 1 ? 's' : ''}</strong>. Anexe documentos e descreva a contestação.
                      </p>
                    </div>
                    <span style={{ background: remainingDays! <= 1 ? '#fee2e2' : 'rgba(24, 88, 131, 0.1)', color: remainingDays! <= 1 ? '#dc2626' : 'var(--primary-color)', border: `1px solid ${remainingDays! <= 1 ? '#fca5a5' : 'var(--primary-color)'}`, borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', whiteSpace: 'nowrap' }}>
                      ⏱ {remainingDays}d restante{remainingDays !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {defenseSuccess ? (
                    <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', borderRadius: '8px', padding: '1rem', fontSize: '0.875rem', color: '#10b981', fontWeight: 600 }}>
                      ✅ {defenseSuccess}
                    </div>
                  ) : (
                    <>
                      {/* Drop Zone */}
                      <div
                        onDrop={handleDropFiles}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => fileInputRef.current?.click()}
                        style={{ border: '2px dashed var(--border-color)', borderRadius: '8px', padding: '1.25rem', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s', marginBottom: '0.75rem', background: 'var(--bg)' }}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx"
                          style={{ display: 'none' }}
                          onChange={(e) => handleAddFiles(e.target.files)}
                        />
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>📎</div>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          Arraste arquivos aqui ou <strong style={{ color: 'var(--primary-color)' }}>clique para selecionar</strong>
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Formatos aceitos: PDF, DOC, DOCX
                        </p>
                      </div>

                      {/* File list */}
                      {defenseFiles.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
                          {defenseFiles.map((f, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
                              <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                                {f.name.endsWith('.pdf') ? '📄' : '📝'} {f.name}
                              </span>
                              <button onClick={() => setDefenseFiles(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>×</button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Description */}
                      <textarea
                        value={defenseDescription}
                        onChange={(e) => setDefenseDescription(e.target.value)}
                        placeholder="Descreva a defesa: contexto da venda, evidências, histórico do cliente..."
                        rows={4}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg)', color: 'var(--text-main)', fontSize: '0.875rem', resize: 'vertical', boxSizing: 'border-box' }}
                      />

                      {defenseError && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#dc2626' }}>⚠️ {defenseError}</div>
                      )}

                      <button
                        onClick={handleSubmitDefense}
                        disabled={isSubmittingDefense || !defenseDescription.trim()}
                        style={{ marginTop: '0.75rem', width: '100%', padding: '0.75rem', borderRadius: '6px', background: 'var(--primary-color)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', opacity: (isSubmittingDefense || !defenseDescription.trim()) ? 0.5 : 1, transition: 'opacity 0.2s' }}
                      >
                        {isSubmittingDefense ? 'Enviando à adquirente...' : '🛡️ Enviar Defesa'}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Observation */}
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', fontWeight: 600 }}>Observações Internas</h4>
                <textarea
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  placeholder="Digite observações internas sobre este chargeback..."
                  rows={4}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg)', color: 'var(--text-main)', fontSize: '0.875rem', resize: 'vertical', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                  <button onClick={handleUpdateObservation} disabled={isSaving} style={{ padding: '0.6rem 1.25rem', borderRadius: '6px', background: 'var(--primary-color)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, opacity: isSaving ? 0.7 : 1 }}>
                    {isSaving ? 'Salvando...' : 'Salvar Observação'}
                  </button>
                </div>
              </div>

              {/* Extra Charge (expired chargebacks) */}
              {selectedChargeback.chargebackAt && calculateRemainingDays(selectedChargeback.chargebackAt) <= 0 && (
                <div style={{ padding: '1.25rem 1.5rem', background: 'rgba(239,68,68,0.04)' }}>
                  <h4 style={{ margin: '0 0 0.5rem', color: '#ef4444', fontSize: '0.95rem', fontWeight: 700 }}>Disputa Encerrada — Lançar Cobrança Extra</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 1rem' }}>Repasse um custo extra ao cliente como crédito no extrato.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>Valor da cobrança (ex: 50.00)</label>
                      <input type="number" placeholder="Valor (ex: 50.00)" value={extraChargeAmount} onChange={e => setExtraChargeAmount(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg)', color: 'var(--text-main)', fontSize: '0.875rem' }} />
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>Motivo da cobrança</label>
                      <input type="text" placeholder="Motivo da cobrança" value={extraChargeReason} onChange={e => setExtraChargeReason(e.target.value)} style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg)', color: 'var(--text-main)', fontSize: '0.875rem' }} />
                    </div>
                    <button onClick={handleLaunchExtraCharge} disabled={isCharging || !extraChargeAmount || !extraChargeReason} style={{ padding: '0.75rem', width: '100%', borderRadius: '6px', background: '#10b981', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, opacity: (isCharging || !extraChargeAmount || !extraChargeReason) ? 0.5 : 1 }}>
                      {isCharging ? 'Lançando...' : 'Lançar Cobrança no Extrato'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(248,250,252,0.4)' }}>
              <button onClick={closeModal} style={{ padding: '0.6rem 1.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'none', cursor: 'pointer', color: 'var(--text-main)', fontWeight: 600 }}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
