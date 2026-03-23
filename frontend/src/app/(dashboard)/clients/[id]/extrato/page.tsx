"use client";

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './extrato.module.css';

// MOCK TRASACTIONS DATA
const MOCK_TRANSACTIONS = [
  { 
    id: '5YJB3Z7X3R', 
    date: '18/03/2026 às 12:01', 
    product: 'KIT AUTISMO 980 ATIVIDADES (#52399382 - Oferta R$10)',
    productCode: '#31960057', 
    amount: 10.00, 
    method: 'PIX', 
    status: 'WAITING',
    clientName: 'Emerson Teste',
    clientCpf: '110.770.144-90',
    clientEmail: 'potenciadodigital.mkt@gmail.com',
    clientPhone: '+55 (81) 98435-5026',
    clientGender: 'Masculino',
    clientType: 'Pessoa física',
    gateway: 'MercadoPago',
    condition: 'R$ 10,00 à vista'
  },
  { 
    id: '8HNK5C2P9M', 
    date: '18/03/2026 às 10:15', 
    product: 'Mentoria Vip',
    productCode: '#31960058', 
    amount: 997.00, 
    method: 'Cartão de Crédito', 
    status: 'APPROVED',
    clientName: 'João Silva',
    clientCpf: '123.456.789-00',
    clientEmail: 'joao@email.com',
    clientPhone: '+55 (11) 99999-9999',
    clientGender: 'Masculino',
    clientType: 'Pessoa física',
    gateway: 'Stripe',
    condition: '12x de R$ 99,70'
  },
  { id: '1A2B3C4D5E', date: '17/03/2026 às 18:45', product: 'E-book Start', productCode: '#31960059', amount: 47.00, method: 'Boleto', status: 'COMPLETED', clientName: 'Maria Oliveira', clientCpf: '321.654.987-01', clientEmail: 'maria@email.com', clientPhone: '+55 (21) 98888-8888', clientGender: 'Feminino', clientType: 'Pessoa física', gateway: 'MercadoPago', condition: 'R$ 47,00 à vista' },
  { id: '9Z8Y7X6W5V', date: '17/03/2026 às 15:20', product: 'Plano Gold', productCode: '#31960060', amount: 297.00, method: 'Cartão de Crédito', status: 'REFUSED', clientName: 'Carlos Souza', clientCpf: '111.222.333-44', clientEmail: 'carlos@email.com', clientPhone: '+55 (31) 97777-7777', clientGender: 'Masculino', clientType: 'Pessoa física', gateway: 'Cielo', condition: '1x de R$ 297,00' },
  { id: '5T4R3E2W1Q', date: '16/03/2026 às 09:10', product: 'Mentoria Vip', productCode: '#31960061', amount: 997.00, method: 'Cartão de Crédito', status: 'NOT_COMPLETED', clientName: 'Ana Pereira', clientCpf: '555.666.777-88', clientEmail: 'ana@email.com', clientPhone: '+55 (41) 96666-6666', clientGender: 'Feminino', clientType: 'Pessoa física', gateway: 'Stripe', condition: '12x de R$ 99,70' },
  { id: '0P9O8I7U6Y', date: '14/03/2026 às 11:00', product: 'Plano Pro', productCode: '#31960062', amount: 497.00, method: 'Cartão de Crédito', status: 'REVERSED', clientName: 'Lucas Lima', clientCpf: '999.888.777-66', clientEmail: 'lucas@email.com', clientPhone: '+55 (51) 95555-5555', clientGender: 'Masculino', clientType: 'Pessoa física', gateway: 'MercadoPago', condition: 'R$ 497,00 à vista' },
  { id: '1Q2W3E4R5T', date: '12/03/2026 às 08:30', product: 'Plano Pro', productCode: '#31960063', amount: 497.00, method: 'PIX', status: 'CLAIMED', clientName: 'Roberto Firmino', clientCpf: '444.333.222-11', clientEmail: 'roberto@email.com', clientPhone: '+55 (61) 94444-4444', clientGender: 'Masculino', clientType: 'Pessoa física', gateway: 'MercadoPago', condition: 'R$ 497,00 à vista' },
  { id: '6Y7U8I9O0P', date: '10/03/2026 às 16:50', product: 'Plano VIP', productCode: '#31960064', amount: 1497.00, method: 'Cartão de Crédito', status: 'CHARGEBACK', clientName: 'Fernanda Costa', clientCpf: '777.666.555-44', clientEmail: 'fernanda@email.com', clientPhone: '+55 (71) 93333-3333', clientGender: 'Feminino', clientType: 'Pessoa física', gateway: 'Stripe', condition: '12x de R$ 149,70' },
];

const getStatusBadgeConfig = (status: string) => {
  switch(status) {
    case 'APPROVED': 
      return { className: styles.statusApproved, label: 'Aprovada' };
    case 'COMPLETED': 
      return { className: styles.statusCompleted, label: 'Finalizada' };
    case 'WAITING': 
      return { className: styles.statusWaiting, label: 'Aguardando Pagamento' };
    case 'REFUSED': 
      return { className: styles.statusRefused, label: 'Recusada (Fraude)' };
    case 'NOT_COMPLETED': 
      return { className: styles.statusNotCompleted, label: 'Dados Inválidos' };
    case 'REVERSED': 
      return { className: styles.statusReversed, label: 'Estornada' };
    case 'CLAIMED': 
      return { className: styles.statusClaimed, label: 'Reembolsada' };
    case 'CHARGEBACK': 
      return { className: styles.statusChargeback, label: 'Chargeback' };
    default: 
      return { className: '', label: status };
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function ExtratoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'geral' | 'historico' | 'taxas'>('geral');

  // Load selected transaction data
  const selectedTx = MOCK_TRANSACTIONS.find(t => t.id === selectedTxId);

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

    if (activeTab === 'geral') {
      return (
        <>
          <div className={styles.detailGrid}>
            <span className={styles.detailLabel}>Cliente</span>
            <span className={styles.detailValue}>{selectedTx.clientName}</span>

            <span className={styles.detailLabel}>Gênero</span>
            <span className={styles.detailValue}>{selectedTx.clientGender}</span>

            <span className={styles.detailLabel}>Tipo</span>
            <span className={styles.detailValue}>{selectedTx.clientType}</span>

            <span className={styles.detailLabel}>CPF</span>
            <span className={styles.detailValue}>{selectedTx.clientCpf}</span>

            <span className={styles.detailLabel}>E-mail</span>
            <span className={styles.detailValue}>{selectedTx.clientEmail}</span>

            <span className={styles.detailLabel}>Telefone</span>
            <span className={styles.detailValue}>{selectedTx.clientPhone}</span>
          </div>

          <div className={styles.productSection}>
            <div className={styles.productInfo}>
              <div style={{ fontSize: '2rem' }}>📦</div>
              <div className={styles.productDesc}>
                <span className={styles.productCode}>Código: {selectedTx.productCode}</span>
                <span className={styles.productName}>{selectedTx.product}</span>
              </div>
            </div>
            <div className={styles.productPrice}>{formatCurrency(selectedTx.amount)}</div>
          </div>

          <div className={styles.detailGrid}>
            <span className={styles.detailLabel}>Data do pedido</span>
            <span className={styles.detailValue}>{selectedTx.date}</span>

            <span className={styles.detailLabel}>Total dos itens (+)</span>
            <span className={styles.detailValue}>{formatCurrency(selectedTx.amount)}</span>

            <span className={styles.detailLabel}>Valor da venda (=)</span>
            <span className={styles.detailValueBold}>{formatCurrency(selectedTx.amount)}</span>
            <span className={styles.detailLabel}>Meio de pagamento</span>
            <span className={styles.detailValue}>{selectedTx.method}</span>

            <span className={styles.detailLabel}>Condição de pagamento</span>
            <span className={styles.detailValue}>{selectedTx.condition}</span>
          </div>

          {selectedTx.status === 'WAITING' && (
            <div className={styles.warningBanner}>
              ⚠️ Aguardando pagamento do {selectedTx.method} ou reprocessar.
            </div>
          )}
          {selectedTx.status === 'NOT_COMPLETED' && (
            <div className={styles.errorBanner}>
              ❌ Compra recusada por dados incorretos ou inválidos do cartão de crédito.
            </div>
          )}
          {selectedTx.status === 'REFUSED' && (
            <div className={styles.errorBanner}>
              ❌ Compra recusada pelo Antifraude ou pela Instituição emissora do cartão.
            </div>
          )}
        </>
      );
    }

    if (activeTab === 'historico') {
      const isApproved = ['APPROVED', 'COMPLETED', 'CLAIMED', 'REVERSED', 'CHARGEBACK'].includes(selectedTx.status);
      
      // Criar a data de aprovação (mockada adicionando 2 minutos à data de criação)
      // Como estamos lindando com mock str tipo '18/03/2026 às 12:01', vai ser apenas ilustrativo
      const approvedDateStr = selectedTx.date.replace('12:01', '12:03')
                                             .replace('10:15', '10:16')
                                             .replace('18:45', '18:46');

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem' }}>
              Histórico de status da venda
            </h3>
            <div>
              <table className={`${styles.table} ${styles.modalTable}`}>
                <thead>
                  <tr>
                    <th className={styles.tableHeaderLight}>Data ↑↓</th>
                    <th className={styles.tableHeaderLight}>Status</th>
                    <th className={styles.tableHeaderLight} style={{ width: '100%' }}>Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {isApproved && (
                    <tr style={{ backgroundColor: 'transparent' }}>
                      <td className={styles.textMuted}>{approvedDateStr}</td>
                      <td><span className={`${styles.statusBadge} ${styles.statusApproved}`}>Aprovada</span></td>
                      <td className={styles.textMuted}>O pagamento foi aprovado e processado com sucesso.</td>
                    </tr>
                  )}
                  <tr style={{ backgroundColor: 'transparent' }}>
                    <td className={styles.textMuted}>{selectedTx.date}</td>
                    <td><span className={`${styles.statusBadge} ${styles.statusWaiting}`}>Aguardando</span></td>
                    <td className={styles.textMuted}>
                      {selectedTx.method === 'PIX' ? 'QRCode para pagamento do PIX gerado com sucesso.' : 'Processo de compra inciado.'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem' }}>
              Histórico de vendas para esse cliente
            </h3>
            <div className={styles.tableWrapper} style={{ overflowX: 'hidden' }}>
              <table className={`${styles.table} ${styles.modalTable}`}>
                <thead>
                  <tr>
                    <th className={styles.tableHeaderLight}>Data status ↑↓</th>
                    <th className={styles.tableHeaderLight}>Transação</th>
                    <th className={styles.tableHeaderLight} style={{ width: '100%' }}>Produto</th>
                    <th className={styles.tableHeaderLight}>Sua comissão</th>
                    <th className={styles.tableHeaderLight}>Status</th>
                    <th className={styles.tableHeaderLight}></th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ backgroundColor: 'transparent' }}>
                    <td className={styles.textMuted}>{selectedTx.date}</td>
                    <td className={styles.textMuted}>#{selectedTx.id}</td>
                    <td>{selectedTx.product.split('(')[0].trim()}</td>
                    <td>{formatCurrency(selectedTx.amount * 0.95)}</td>
                    <td><span className={`${styles.statusBadge} ${getStatusBadgeConfig(selectedTx.status).className}`}>{getStatusBadgeConfig(selectedTx.status).label}</span></td>
                    <td><button className={styles.btnViewSmall}>Ver</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'taxas') {
      const isPix = selectedTx.method === 'PIX';
      // Mocked calculation based on Plans & Liquidations logic requested
      const processingFee = isPix ? 1.00 : selectedTx.amount * 0.0499; 
      const fixedFee = isPix ? 0 : 1.00;
      const totalFees = processingFee + fixedFee;
      const netValue = selectedTx.amount - totalFees;

      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <p className={styles.textMuted}>
            Veja abaixo as taxas e os valores de cada participante da venda:
          </p>
          <div className={styles.producerBanner}>
            Você participou dessa venda como <strong>produtor</strong>.
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
                <td>Total pago pelo comprador:</td>
                <td className={styles.textMuted}>{formatCurrency(selectedTx.amount)}</td>
              </tr>
              <tr>
                <td>Valor da venda sem taxas e impostos:</td>
                <td className={styles.textMuted}>{formatCurrency(selectedTx.amount)}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>Valor base para cálculo de comissões:</td>
                <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{formatCurrency(selectedTx.amount)}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: '#10b981' }}>Sua comissão: (após taxas produtor)</td>
                <td style={{ color: '#10b981', fontWeight: 600, fontSize: '1.1rem' }}>{formatCurrency(netValue)}</td>
              </tr>
            </tbody>
          </table>
          <p className={styles.textMuted} style={{ marginTop: '1.5rem', fontSize: '0.85rem' }}>
            Taxa transparente aplicada à transação: 
            {isPix ? ' R$ 1,00 por liquidação PIX.' : ' 4.99% + R$ 1,00 (Plano Padrão Cartão).'}
          </p>
        </div>
      );
    }
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
            Histórico completo de transações e status de processamento (Cliente #{resolvedParams.id})
          </p>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Total Aprovado</h3>
          <div className={`${styles.statValue} ${styles.statPositive}`}>
            {formatCurrency(1044.00)}
          </div>
        </div>

        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Em Processamento</h3>
          <div className={styles.statValue}>
            {formatCurrency(57.00)}
          </div>
        </div>

        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Total Estornado/Reembolsado</h3>
          <div className={`${styles.statValue} ${styles.statNegative}`}>
            {formatCurrency(2491.00)}
          </div>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableToolbar}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Transações</h2>
          <select className={styles.filterSelect}>
            <option value="">Status da Transação: Todos</option>
            <option value="APPROVED">Aprovadas</option>
            <option value="COMPLETED">Finalizadas (Pós-Garantia)</option>
            <option value="WAITING">Aguardando Pagamento</option>
            <option value="REFUSED">Recusada (Fraude)</option>
            <option value="NOT_COMPLETED">Dados Inválidos</option>
            <option value="REVERSED">Estornos / Reembolsos / Chargeback</option>
          </select>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data</th>
                <th>ID da Transação</th>
                <th>Produto</th>
                <th>Método</th>
                <th>Valor</th>
                <th>Status</th>
                <th className={styles.actionsCell}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TRANSACTIONS.map((trx) => {
                const badge = getStatusBadgeConfig(trx.status);
                return (
                  <tr key={trx.id}>
                    <td className={styles.textMuted}>{trx.date.split(' às')[0]}</td>
                    <td className={styles.fontWeightMedium}>{trx.id}</td>
                    <td>{trx.product.split('(')[0].trim()}</td>
                    <td className={styles.textMuted}>{trx.method}</td>
                    <td className={styles.fontWeightMedium}>{formatCurrency(trx.amount)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${badge.className}`} title={trx.status}>
                        {badge.label}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <button 
                        className={styles.btnActionDots} 
                        onClick={() => handleOpenDetail(trx.id)}
                        title="Detalhes da Venda"
                      >
                        ⋮
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <span className={styles.paginationText}>Mostrando 1 a {MOCK_TRANSACTIONS.length} de {MOCK_TRANSACTIONS.length} transações</span>
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
              <h2>Detalhes da venda #{selectedTx.id}</h2>
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
              <button className={styles.btnCancelItem}>Estornar venda</button>
              <button className={styles.btnCloseModal} onClick={closeModal}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
