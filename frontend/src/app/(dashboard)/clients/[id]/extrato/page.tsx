"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from './extrato.module.css';

// MOCK TRASACTIONS DATA REMOVED AS IT WAS UNUSED

const getStatusBadgeConfig = (status: string) => {
  switch(status) {
    case 'APPROVED': 
    case 'COMPLETED': 
      return { className: styles.statusApproved, label: 'Aprovada' };
    case 'WAITING': 
    case 'PENDING':
      return { className: styles.statusWaiting, label: 'Aguardando' };
    case 'REFUSED': 
      return { className: styles.statusRefused, label: 'Recusada' };
    case 'REVERSED': 
    case 'CLAIMED': 
    case 'CHARGEBACK': 
      return { className: styles.statusReversed, label: 'Chargeback/Reembolso' };
    default: 
      return { className: '', label: status };
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function ExtratoPage() {
  const params = useParams();
  const id = params.id as string;
  const [statement, setStatement] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'geral' | 'historico' | 'taxas'>('geral');

  useEffect(() => {
    const fetchStatement = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3001/producers/${id}/statement`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          setStatement(data);
        }
      } catch (error) {
        console.error('Failed to fetch statement:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatement();
  }, [id]);

  // Load selected transaction data
  const selectedTx = statement.find(t => t.id === selectedTxId);

  const stats = {
    approved: statement.filter(s => s.type === 'TRANSACTION' && (s.status === 'APPROVED' || s.status === 'COMPLETED')).reduce((acc, curr) => acc + curr.amount, 0),
    processing: statement.filter(s => s.status === 'WAITING' || s.status === 'PENDING').reduce((acc, curr) => acc + Math.abs(curr.amount), 0),
    withdrawn: statement.filter(s => s.type === 'WITHDRAWAL' && s.status === 'COMPLETED').reduce((acc, curr) => acc + Math.abs(curr.amount), 0),
  };

  const handleOpenDetail = (id: string) => {
    setSelectedTxId(id);
    setActiveTab('geral');
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

  const renderTabContent = () => {
    if (!selectedTx) return null;

    if (selectedTx.type === 'WITHDRAWAL') {
      return (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(248, 250, 252, 0.4)', borderRadius: 'var(--radius-md)' }}>
          <div className={styles.detailGrid}>
            <span className={styles.detailLabel}>Tipo</span>
            <span className={styles.detailValue}>Saque Bancário</span>

            <span className={styles.detailLabel}>Valor do Saque</span>
            <span className={styles.statNegative} style={{ fontWeight: 600 }}>{formatCurrency(selectedTx.amount)}</span>

            <span className={styles.detailLabel}>Status Atual</span>
            <td><span className={`${styles.statusBadge} ${getStatusBadgeConfig(selectedTx.status).className}`}>{getStatusBadgeConfig(selectedTx.status).label}</span></td>

            <span className={styles.detailLabel}>Data da Solicitação</span>
            <span className={styles.detailValue}>{new Date(selectedTx.createdAt).toLocaleString('pt-BR')}</span>
          </div>
          <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Solicitação de saque enviada para processamento. Caso aprovada, o valor será transferido para a conta cadastrada.
          </p>
        </div>
      );
    }

    if (activeTab === 'geral') {
      return (
        <>
          <div className={styles.detailGrid}>
            <span className={styles.detailLabel}>Cliente</span>
            <span className={styles.detailValue}>{selectedTx.customerName || 'N/A'}</span>

            <span className={styles.detailLabel}>ID da Transação</span>
            <span className={styles.detailValue}>#{selectedTx.id}</span>
          </div>

          <div className={styles.productSection}>
            <div className={styles.productInfo}>
              <div style={{ fontSize: '2rem' }}>📦</div>
              <div className={styles.productDesc}>
                <span className={styles.productName}>{selectedTx.description}</span>
              </div>
            </div>
            <div className={styles.productPrice}>{formatCurrency(Math.abs(selectedTx.amount))}</div>
          </div>

          <div className={styles.detailGrid}>
            <span className={styles.detailLabel}>Data</span>
            <span className={styles.detailValue}>{new Date(selectedTx.createdAt).toLocaleString('pt-BR')}</span>

            <span className={styles.detailLabel} style={{ fontWeight: 600, color: 'var(--text-main)' }}>Valor Final (=)</span>
            <span className={styles.detailValueBold}>{formatCurrency(Math.abs(selectedTx.amount))}</span>
          </div>
        </>
      );
    }

    if (activeTab === 'historico') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem' }}>
              Histórico de status
            </h3>
            <table className={`${styles.table} ${styles.modalTable}`}>
              <thead>
                <tr>
                  <th className={styles.tableHeaderLight}>Data</th>
                  <th className={styles.tableHeaderLight}>Status</th>
                  <th className={styles.tableHeaderLight} style={{ width: '100%' }}>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ backgroundColor: 'transparent' }}>
                  <td className={styles.textMuted}>{new Date(selectedTx.createdAt).toLocaleString('pt-BR')}</td>
                  <td><span className={`${styles.statusBadge} ${getStatusBadgeConfig(selectedTx.status).className}`}>{getStatusBadgeConfig(selectedTx.status).label}</span></td>
                  <td className={styles.textMuted}>Movimentação registrada no sistema.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeTab === 'taxas') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <p className={styles.textMuted}>
            Taxas e comissões detalhadas para esta movimentação:
          </p>
          <div className={styles.producerBanner} style={{ backgroundColor: selectedTx.type === 'WITHDRAWAL' ? '#94a3b8' : '#2cb5c6' }}>
            Esta operação de <strong>{selectedTx.type === 'TRANSACTION' ? 'venda' : 'saque'}</strong> foi processada com sucesso.
          </div>
          <table className={`${styles.feesTable} ${styles.modalTable}`}>
            <thead>
              <tr>
                <th>Indicador</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Bruto:</td>
                <td className={styles.textMuted}>{formatCurrency(Math.abs(selectedTx.amount))}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Líquido:</td>
                <td style={{ fontWeight: 600 }}>{formatCurrency(Math.abs(selectedTx.amount))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div className={styles.titleWrapper}>
            <Link href="/clients" className={styles.btnBack}>← Voltar</Link>
            <h1 className="title">Extrato do Cliente</h1>
          </div>
          <p className="subtitle" style={{ marginTop: '0.5rem' }}>
            Histórico completo de transações e status de processamento (Cliente #{id})
          </p>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Total Aprovado</h3>
          <div className={`${styles.statValue} ${styles.statPositive}`}>
            {formatCurrency(stats.approved)}
          </div>
        </div>

        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Em Processamento</h3>
          <div className={styles.statValue}>
            {formatCurrency(stats.processing)}
          </div>
        </div>

        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Total Sacado</h3>
          <div className={`${styles.statValue} ${styles.statNegative}`}>
            {formatCurrency(stats.withdrawn)}
          </div>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableToolbar}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Extrato de Movimentações</h2>
          <select className={styles.filterSelect}>
            <option value="">Tipo: Todos</option>
            <option value="TRANSACTION">Vendas</option>
            <option value="WITHDRAWAL">Saques</option>
          </select>
        </div>

        <div className={styles.tableWrapper}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Carregando extrato...
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>ID</th>
                  <th>Descrição</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th className={styles.actionsCell}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {statement.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      Nenhuma movimentação encontrada.
                    </td>
                  </tr>
                ) : (
                  statement.map((item) => {
                    const badge = getStatusBadgeConfig(item.status);
                    return (
                      <tr key={item.id}>
                        <td className={styles.textMuted}>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</td>
                        <td className={styles.fontWeightMedium}>#{item.id.slice(-6).toUpperCase()}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span>{item.description}</span>
                            {item.customerName && <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Cliente: {item.customerName}</small>}
                          </div>
                        </td>
                        <td className={styles.textMuted}>{item.type === 'TRANSACTION' ? 'Venda' : 'Saque'}</td>
                        <td className={item.amount < 0 ? styles.statNegative : styles.statPositive} style={{ fontWeight: 600 }}>
                          {formatCurrency(item.amount)}
                        </td>
                        <td>
                          <span className={`${styles.statusBadge} ${badge.className}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className={styles.actionsCell}>
                          <button 
                            className={styles.btnActionDots} 
                            onClick={() => handleOpenDetail(item.id)}
                            title="Detalhes"
                          >
                            ⋮
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className={styles.pagination}>
          <span className={styles.paginationText}>Mostrando 1 a {statement.length} de {statement.length} movimentações</span>
          <div className={styles.paginationControls}>
            <button className={styles.btnPage} disabled>Anterior</button>
            <button className={`${styles.btnPage} ${styles.btnPageActive}`}>1</button>
            <button className={styles.btnPage} disabled>Próxima</button>
          </div>
        </div>
      </div>

      {isModalOpen && selectedTx && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Detalhes da {selectedTx.type === 'TRANSACTION' ? 'venda' : 'movimentação'} #{selectedTx.id.slice(-6).toUpperCase()}</h2>
              <button className={styles.closeBtn} onClick={closeModal}>×</button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.tabs}>
                <button 
                  className={`${styles.tab} ${activeTab === 'geral' ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab('geral')}
                >
                  Geral
                </button>
                <button 
                  className={`${styles.tab} ${activeTab === 'historico' ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab('historico')}
                >
                  Histórico
                </button>
                <button 
                  className={`${styles.tab} ${activeTab === 'taxas' ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab('taxas')}
                >
                  Taxas e comissões
                </button>
              </div>

              {renderTabContent()}

            </div>

            <div className={styles.modalFooter}>
              {selectedTx.type === 'TRANSACTION' && <button className={styles.btnCancelItem}>Estornar venda</button>}
              <button className={styles.btnCloseModal} onClick={closeModal}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
