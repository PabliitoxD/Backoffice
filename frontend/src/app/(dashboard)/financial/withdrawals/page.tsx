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
  const [modalData, setModalData] = useState<any | null>(null);
  const [infoModalData, setInfoModalData] = useState<any | null>(null);
  const [observation, setObservation] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const statusMap: Record<string, string> = {
    'PENDING': 'Pendente',
    'APPROVED': 'Aguardando Repasse',
    'REFUSED': 'Recusado',
    'COMPLETED': 'Processado'
  };

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Build query params
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (searchQuery) params.append('search', searchQuery);
      if (filterStatus && filterStatus !== 'ALL') params.append('status', filterStatus);

      const res = await fetch(`${API_URL}/withdrawals?${params.toString()}`, {
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

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    const approvelList = withdrawals.filter(w => w.status === 'APPROVED').map(w => w.id);
    if (approvelList.length === 0) return;
    if (selectedIds.length === approvelList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(approvelList);
    }
  };

  const notifyFinance = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`Confirmar envio de ${selectedIds.length} saque(s) ao financeiro?`)) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/withdrawals/notify-finance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ withdrawalIds: selectedIds })
      });
      if (res.ok) {
        alert('Notificação enviada com sucesso! Verifique o console do backend.');
        setSelectedIds([]);
        fetchWithdrawals();
      } else {
        alert('Erro ao notificar.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (item: any, newStatus: string) => {
    setModalData({ ...item, newStatus });
    setObservation('');
  };

  const confirmAction = async () => {
    if (!modalData) return;
    if (!observation.trim()) {
      alert("A observação/motivo é obrigatória para esta operação.");
      return;
    }
    
    const { id, newStatus } = modalData;
    setProcessing(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/withdrawals/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, observation })
      });
      
      if (res.ok) {
        alert("Operação realizada com sucesso!");
        fetchWithdrawals(); // Recarrega
        setModalData(null);
      } else {
        alert("Erro ao realizar operação");
        setWithdrawals(prev => prev.filter(w => w.id !== id)); // Mock behavior
        setModalData(null);
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
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Tabela de Saques</h2>
          
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
              placeholder="Pesquisar por ID ou Produtor..."
              style={{ padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.9rem', flex: 1, minWidth: '200px' }} 
            />

            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: '0.65rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#1e293b', color: '#f8fafc', outline: 'none', fontSize: '0.9rem', cursor: 'pointer' }}
            >
              <option value="ALL">Status: Todos</option>
              <option value="PENDING">Pendente</option>
              <option value="APPROVED">Aguardando Repasse</option>
              <option value="COMPLETED">Processado</option>
              <option value="REFUSED">Recusado</option>
            </select>

            <button 
              onClick={fetchWithdrawals} 
              className={`${styles.btnAction} ${styles.btnSuccess}`} 
              style={{ padding: '0.65rem 1.5rem', fontWeight: 600 }}
            >
              Buscar
            </button>
          </div>
          
          {selectedIds.length > 0 && (
            <div style={{ padding: '0.75rem 1rem', backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#0369a1', fontWeight: 600 }}>{selectedIds.length} saque(s) selecionado(s)</span>
              <button 
                onClick={notifyFinance}
                style={{ cursor: 'pointer', padding: '0.5rem 1rem', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600 }}
              >
                Notificar Financeiro (E-mail)
              </button>
            </div>
          )}
        </div>
        
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    onChange={toggleAll}
                    checked={withdrawals.filter(w => w.status === 'APPROVED').length > 0 && selectedIds.length === withdrawals.filter(w => w.status === 'APPROVED').length}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th>Data</th>
                <th>Produtor</th>
                <th>Valor Bruto</th>
                <th>Tarifa</th>
                <th>Repasse Líquido</th>
                <th>Status Atual</th>
                <th style={{ textAlign: 'center' }}>Detalhes</th>
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
                  const payout = item.amount - fee;
                  return (
                    <tr 
                      key={item.id} 
                      onClick={() => setInfoModalData(item)}
                      style={{ 
                        backgroundColor: selectedIds.includes(item.id) ? '#f0f9ff' : 'transparent',
                        cursor: 'pointer'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = selectedIds.includes(item.id) ? '#e0f2fe' : 'var(--bg-secondary)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = selectedIds.includes(item.id) ? '#f0f9ff' : 'transparent'}
                    >
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          disabled={item.status !== 'APPROVED'}
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelection(item.id)}
                          style={{ cursor: item.status === 'APPROVED' ? 'pointer' : 'not-allowed' }}
                        />
                      </td>
                      <td className={styles.textMuted}>{new Date(item.createdAt).toLocaleDateString('pt-BR')} <span style={{display: 'block', fontSize: '0.8rem'}}>{new Date(item.createdAt).toLocaleTimeString('pt-BR')}</span></td>
                      <td className={styles.fontWeightMedium}>{item.producer?.name || 'Desconhecido'}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(item.amount)}</td>
                      <td className={styles.textMuted}>{formatCurrency(fee)}</td>
                      <td className={styles.fontWeightMedium} style={{ color: '#10b981' }}>{formatCurrency(payout)}</td>
                      <td>
                        <span className={`${styles.badge} ${styles.badgeWarning}`}>
                          {statusMap[item.status] || item.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => setInfoModalData(item)}
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
                        >
                          Visualizar
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {(item.status === 'PENDING' || item.status === 'APPROVED') ? (
                            <>
                              <button 
                                className={`${styles.btnAction} ${styles.btnSuccess}`}
                                onClick={() => handleActionClick(item, item.status === 'PENDING' ? 'APPROVED' : 'COMPLETED')}
                                disabled={processing === item.id}
                              >
                                {item.status === 'PENDING' ? 'Aprovar' : 'Marcar Processado'}
                              </button>
                              {item.status === 'PENDING' && (
                                <button 
                                  className={`${styles.btnAction} ${styles.btnDangerOutlined}`}
                                  onClick={() => handleActionClick(item, 'REFUSED')}
                                  disabled={processing === item.id}
                                >
                                  Recusar
                                </button>
                              )}
                            </>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nenhuma ação pendente</span>
                          )}
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

      {modalData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <div style={{ backgroundColor: 'var(--surface)', color: 'var(--text-main)', padding: '2rem', borderRadius: '8px', width: '400px', maxWidth: '90%', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginTop: 0, fontSize: '1.2rem', fontWeight: 600 }}>
              {modalData.newStatus === 'APPROVED' ? 'Aprovar Solicitação de Saque' 
                : modalData.newStatus === 'COMPLETED' ? 'Confirmar Repasse PIX' 
                : 'Recusar Saque'}
            </h3>
            
            <div style={{ padding: '1rem', backgroundColor: 'var(--background)', borderRadius: '6px', marginBottom: '1rem', border: '1px solid var(--border-color)', marginTop: '1rem', color: 'var(--text-main)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Produtor</div>
              <div style={{ fontWeight: 600 }}>{modalData.producer?.name || 'N/A'}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Documento</div>
              <div style={{ fontWeight: 500 }}>{modalData.producer?.document || 'N/A'}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Chave PIX Informada</div>
              <div style={{ fontWeight: 600, color: '#10b981', fontSize: '1.1rem' }}>{modalData.pixKey || modalData.producer?.pixKey || 'Não registrada'}</div>
              
              <div style={{ padding: '0.75rem 0', margin: '0.75rem 0', borderTop: '1px dashed var(--border-color)', borderBottom: '1px dashed var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Valor Bruto (Impacto)</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(modalData.amount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tarifa Bancária</span>
                  <span style={{ color: '#ef4444' }}>- {formatCurrency(modalData.fee || 5.00)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Repasse Líquido</span>
                <span style={{ fontWeight: 700, fontSize: '1.2rem', color: '#10b981' }}>{formatCurrency(modalData.amount - (modalData.fee || 5.00))}</span>
              </div>
            </div>

            <p style={{ color: 'var(--text-muted, #666)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Por favor, insira o motivo ou observação operacional para este status. Este campo é <strong>obrigatório</strong>.
            </p>
            <textarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Digite a observação aqui..."
              rows={4}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--background)', color: 'var(--text-main)', fontSize: '0.95rem', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setModalData(null)}
                className={`${styles.btnAction} ${styles.btnDangerOutlined}`}
                style={{ padding: '0.5rem 1rem' }}
              >
                Cancelar
              </button>
              <button 
                onClick={confirmAction}
                className={`${styles.btnAction} ${styles.btnSuccess}`}
                disabled={!observation.trim()}
                style={{ padding: '0.5rem 1rem', opacity: !observation.trim() ? 0.5 : 1, cursor: !observation.trim() ? 'not-allowed' : 'pointer' }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {infoModalData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <div style={{ backgroundColor: 'var(--surface)', color: 'var(--text-main)', padding: '2rem', borderRadius: '8px', width: '450px', maxWidth: '90%', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Detalhes do Saque</h3>
              <button onClick={() => setInfoModalData(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID do Lançamento</div>
                <div style={{ fontWeight: 500, userSelect: 'all' }}>{infoModalData.id}</div>
              </div>
              
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status</div>
                  <span className={`${styles.badge} ${styles.badgeWarning}`}>
                    {statusMap[infoModalData.status] || infoModalData.status}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Data de Solicitação</div>
                  <div style={{ fontWeight: 500 }}>{new Date(infoModalData.createdAt).toLocaleString('pt-BR')}</div>
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: 'var(--background)', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Chave PIX Informada</div>
                <div style={{ fontWeight: 600, color: '#10b981', fontSize: '1rem' }}>{infoModalData.pixKey || infoModalData.producer?.pixKey || 'Não registrada'}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)' }}>
                  <span style={{ fontSize: '0.85rem' }}>Valor Solicitado</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(infoModalData.amount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem' }}>Tarifa</span>
                  <span style={{ color: '#ef4444' }}>- {formatCurrency(infoModalData.fee || 5.0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Repasse Líquido</span>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>{formatCurrency(infoModalData.amount - (infoModalData.fee || 5.0))}</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Motivo / Observação</div>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--background)', border: '1px solid var(--border-color)', borderRadius: '6px', minHeight: '60px', color: 'var(--text-main)', fontStyle: infoModalData.observation ? 'normal' : 'italic', fontSize: '0.95rem' }}>
                  {infoModalData.observation || 'Não há observações operacionais registradas para alterar este status.'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button 
                className={`${styles.btnAction}`}
                style={{ backgroundColor: 'var(--surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
                onClick={() => setInfoModalData(null)}
              >
                Fechar Painel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
