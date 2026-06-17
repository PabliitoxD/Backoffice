"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './statement.module.css';
import modalStyles from '../../transactions/transactions.module.css';
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
  method?: string;
  installments?: string;
  cardBrand?: string;
  runningBalance?: number;
  originalId?: string;
  customer?: any;
  product?: any;
  history?: any;
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
  const [initialBalance, setInitialBalance] = useState(0);
  const [finalBalance, setFinalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'VENDAS' | 'WITHDRAWALS' | 'CHARGEBACKS'>('ALL');
  const [startDate, setStartDate] = useState(currentMonthRange.start);
  const [endDate, setEndDate] = useState(currentMonthRange.end);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'geral' | 'historico' | 'taxas'>('geral');

  const selectedTx = statement.find(t => t.id === selectedTxId);

  const handleOpenDetail = (id: string) => {
    setSelectedTxId(id);
    setActiveModalTab('geral');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTxId(null);
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; }
  }, [isModalOpen]);

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
        setStatement(data.items);
        setInitialBalance(data.initialBalance);
        setFinalBalance(data.finalBalance);
      } else {
        console.error("Failed to fetch statement");
        // Fallback for demo/dev
        setStatement([
          { id: 'tx-1234', type: 'TRANSACTION', description: 'Venda (#1234)', producerName: 'Acme Corp', amount: 997.0, fee: 0, impact: 997.0, status: 'APPROVED', date: new Date().toISOString(), runningBalance: 997.0 },
          { id: 'wt-5678', type: 'WITHDRAWAL', description: 'Saque Bancário', producerName: 'Acme Corp', amount: 500.0, fee: 5.0, impact: -505.0, status: 'COMPLETED', date: new Date(Date.now() - 86400000).toISOString(), runningBalance: 492.0 },
        ]);
        setInitialBalance(0);
        setFinalBalance(492.0);
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

  const getStatusBadgeConfig = (status: string) => {
    switch(status) {
      case 'APPROVED': return { className: modalStyles.statusApproved, label: 'Aprovada' };
      case 'COMPLETED': return { className: modalStyles.statusCompleted, label: 'Finalizada' };
      case 'WAITING': return { className: modalStyles.statusWaiting, label: 'Aguardando' };
      case 'REVERSED': return { className: modalStyles.statusReversed, label: 'Estornada' };
      case 'REFUNDED': return { className: modalStyles.statusClaimed, label: 'Reembolsada' };
      case 'CHARGEBACK': return { className: modalStyles.statusChargeback, label: 'Chargeback' };
      default: return { className: '', label: status };
    }
  };

  const renderTabContent = () => {
    if (!selectedTx || selectedTx.type !== 'TRANSACTION') return null;
    
    if (activeModalTab === 'geral') {
      return (
        <>
          <div className={modalStyles.detailGrid}>
            <span className={modalStyles.detailLabel}>Cliente</span>
            <span className={modalStyles.detailValue}>{selectedTx.customer?.name}</span>
            <span className={modalStyles.detailLabel}>Gênero</span>
            <span className={modalStyles.detailValue}>{selectedTx.customer?.gender || '-'}</span>
            <span className={modalStyles.detailLabel}>Tipo</span>
            <span className={modalStyles.detailValue}>{selectedTx.customer?.type || '-'}</span>
            <span className={modalStyles.detailLabel}>CPF/CNPJ</span>
            <span className={modalStyles.detailValue}>{selectedTx.customer?.document}</span>
            <span className={modalStyles.detailLabel}>E-mail</span>
            <span className={modalStyles.detailValue}>{selectedTx.customer?.email}</span>
            <span className={modalStyles.detailLabel}>Telefone</span>
            <span className={modalStyles.detailValue}>{selectedTx.customer?.phone || '-'}</span>
          </div>

          <div className={modalStyles.productSection}>
            <div className={modalStyles.productInfo}>
              <div style={{ fontSize: '2rem' }}>📦</div>
              <div className={modalStyles.productDesc}>
                <span className={modalStyles.productCode}>Código: {selectedTx.product?.code}</span>
                <span className={modalStyles.productName}>{selectedTx.product?.name}</span>
              </div>
            </div>
            <div className={modalStyles.productPrice}>{formatCurrency(selectedTx.amount)}</div>
          </div>

          <div className={modalStyles.detailGrid}>
            <span className={modalStyles.detailLabel}>Data do pedido</span>
            <span className={modalStyles.detailValue}>{new Date(selectedTx.date).toLocaleString('pt-BR')}</span>
            <span className={modalStyles.detailLabel}>Total dos itens (+)</span>
            <span className={modalStyles.detailValue}>{formatCurrency(selectedTx.amount)}</span>
            <span className={modalStyles.detailLabel}>Valor da venda (=)</span>
            <span className={modalStyles.detailValueBold}>{formatCurrency(selectedTx.amount)}</span>
            <span className={modalStyles.detailLabel}>Meio de pagamento</span>
            <span className={modalStyles.detailValue}>{selectedTx.method}</span>
            <span className={modalStyles.detailLabel}>Condição de pagamento</span>
            <span className={modalStyles.detailValue}>{selectedTx.installments || `À vista`}</span>
          </div>
        </>
      );
    }

    if (activeModalTab === 'historico') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem' }}>
              Histórico de status da venda
            </h3>
            <table className={`${modalStyles.table} ${modalStyles.modalTable}`}>
              <thead>
                <tr>
                  <th className={modalStyles.tableHeaderLight}>Data ↑↓</th>
                  <th className={modalStyles.tableHeaderLight}>Status</th>
                  <th className={modalStyles.tableHeaderLight} style={{ width: '100%' }}>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {selectedTx.history?.map((h: any) => (
                  <tr key={h.id} style={{ backgroundColor: 'transparent' }}>
                    <td className={modalStyles.textMuted}>{new Date(h.createdAt).toLocaleString('pt-BR')}</td>
                    <td><span className={`${modalStyles.statusBadge} ${getStatusBadgeConfig(h.status).className}`}>{getStatusBadgeConfig(h.status).label}</span></td>
                    <td className={modalStyles.textMuted}>{h.details || 'Atualização de status'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeModalTab === 'taxas') {
      const isPix = selectedTx.method === 'PIX';
      const processingFee = isPix ? 1.00 : selectedTx.amount * 0.0499; 
      const fixedFee = isPix ? 0 : 1.00;
      const totalFees = processingFee + fixedFee;
      const netValue = selectedTx.amount - totalFees;

      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <p className={modalStyles.textMuted}>Veja abaixo as taxas e os valores de cada participante da venda:</p>
          <div className={modalStyles.producerBanner}>Você participou dessa venda como <strong>produtor</strong>.</div>
          <table className={`${modalStyles.feesTable} ${modalStyles.modalTable}`}>
            <tbody>
              <tr><td>Total pago pelo comprador:</td><td className={modalStyles.textMuted}>{formatCurrency(selectedTx.amount)}</td></tr>
              <tr><td style={{ fontWeight: 600, color: 'var(--text-main)' }}>Valor base:</td><td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{formatCurrency(selectedTx.amount)}</td></tr>
              <tr><td style={{ fontWeight: 600, color: '#10b981' }}>Sua comissão líquida:</td><td style={{ color: '#10b981', fontWeight: 600, fontSize: '1.1rem' }}>{formatCurrency(netValue)}</td></tr>
            </tbody>
          </table>
        </div>
      );
    }
  };

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
          <h3 className={styles.statTitle}>Saldo Inicial</h3>
          <div className={styles.statValue}>
            {formatCurrency(initialBalance)}
          </div>
          <span className={styles.textMuted} style={{ fontSize: '0.75rem' }}>Anterior a {new Date(startDate).toLocaleDateString('pt-BR')}</span>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Entradas</h3>
          <div className={`${styles.statValue} ${styles.statPositive}`}>
            {formatCurrency(totalIn)}
          </div>
          <span className={styles.textMuted} style={{ fontSize: '0.75rem' }}>No período filtrado</span>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Saídas</h3>
          <div className={`${styles.statValue} ${styles.statNegative}`}>
            {formatCurrency(totalOut)}
          </div>
          <span className={styles.textMuted} style={{ fontSize: '0.75rem' }}>No período filtrado</span>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Saldo Final</h3>
          <div className={`${styles.statValue} ${finalBalance >= 0 ? styles.statPositive : styles.statNegative}`}>
            {formatCurrency(finalBalance)}
          </div>
          <span className={styles.textMuted} style={{ fontSize: '0.75rem' }}>Em {new Date(endDate).toLocaleDateString('pt-BR')}</span>
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
                <th>Pagamento</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Valor</th>
                <th style={{ textAlign: 'right' }}>Saldo Acumulado</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className={styles.emptyState}>Carregando extrato...</td></tr>
              ) : (
                <>
                  {!searchQuery && activeTab === 'ALL' && (
                    <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                      <td className={styles.textMuted} colSpan={5} style={{ textAlign: 'right', fontWeight: 600 }}>
                        SALDO ANTERIOR AO PERÍODO
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: initialBalance >= 0 ? '#10b981' : '#ef4444' }}>
                        {formatCurrency(initialBalance)}
                      </td>
                      <td></td>
                    </tr>
                  )}
                  
                  {filteredStatement.length === 0 ? (
                    <tr><td colSpan={8} className={styles.emptyState}>Nenhuma movimentação encontrada para este filtro.</td></tr>
                  ) : (
                    filteredStatement.map((item) => {
                  const isPositive = item.impact > 0;
                  const isNegative = item.impact < 0;
                  const impactColor = isPositive ? '#10b981' : isNegative ? '#ef4444' : 'var(--text-muted)';
                  const impactSign = isPositive ? '+' : isNegative ? '-' : '';

                  let typeBadgeClass = styles.badgeInfo;
                  if (item.type === 'WITHDRAWAL') typeBadgeClass = styles.badgeWarning;
                  if (item.status === 'CHARGEBACK') typeBadgeClass = styles.badgeDebit;

                  let methodLabel = item.method || 'Transferência';
                  if (item.method === 'Cartão de Crédito' && item.installments) {
                    methodLabel = `Cartão ${item.cardBrand ? `(${item.cardBrand})` : ''} em ${item.installments}`;
                  }

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
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>
                          {methodLabel}
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
                      <td style={{ textAlign: 'right', fontWeight: 700, color: (item.runningBalance || 0) >= 0 ? '#10b981' : '#ef4444' }}>
                         {formatCurrency(item.runningBalance || 0)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          className={styles.btnAction}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                          onClick={() => {
                            if (item.type === 'WITHDRAWAL') {
                              router.push('/financial/withdrawals');
                            } else {
                              handleOpenDetail(item.id);
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
              </>
            )}
          </tbody>
            {filteredStatement.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={4} style={{ textAlign: 'right', fontWeight: 600, padding: '1rem 1.5rem', borderTop: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    Saldo Consolidado (Fim do Período Filtrado):
                  </td>
                  <td colSpan={2} style={{ textAlign: 'right', fontWeight: 700, padding: '1rem 1.5rem', borderTop: '2px solid var(--border-color)', color: filteredBalance >= 0 ? '#10b981' : '#ef4444', fontSize: '1.1rem' }}>
                    {filteredBalance >= 0 ? '+' : ''}{formatCurrency(filteredBalance)}
                  </td>
                  <td style={{ borderTop: '2px solid var(--border-color)' }}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {isModalOpen && selectedTx && (
        <div className={modalStyles.modalOverlay} onClick={closeModal}>
          <div className={modalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={modalStyles.modalHeader}>
              <h2>Detalhes da venda #{selectedTx.originalId?.slice(0,8) || selectedTx.id}</h2>
              <button className={modalStyles.closeBtn} onClick={closeModal}>×</button>
            </div>
            
            <div className={modalStyles.modalBody}>
              <div className={modalStyles.tabs}>
                <button 
                  className={`${modalStyles.tab} ${activeModalTab === 'geral' ? modalStyles.tabActive : ''}`}
                  onClick={() => setActiveModalTab('geral')}
                >
                  Geral
                </button>
                <button 
                  className={`${modalStyles.tab} ${activeModalTab === 'historico' ? modalStyles.tabActive : ''}`}
                  onClick={() => setActiveModalTab('historico')}
                >
                  Histórico
                </button>
                <button 
                  className={`${modalStyles.tab} ${activeModalTab === 'taxas' ? modalStyles.tabActive : ''}`}
                  onClick={() => setActiveModalTab('taxas')}
                >
                  Taxas e comissões
                </button>
              </div>

              {renderTabContent()}

            </div>

            <div className={modalStyles.modalFooter}>
              <button className={modalStyles.btnCloseModal} onClick={closeModal}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
