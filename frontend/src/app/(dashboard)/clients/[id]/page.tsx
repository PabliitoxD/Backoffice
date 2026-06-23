"use client";

import { useState, use } from 'react';
import Link from 'next/link';
import styles from './clientDetails.module.css';

const MOCK_CLIENT = {
  id: 1,
  status: 'Pendente',
  fullName: 'João Silva',
  cpf: '123.456.789-00',
  birthDate: '1985-06-15',
  isPep: false,
  pepPersons: [] as { nome: string; cpf: string }[],
  responsibleName: 'João Silva',
  responsibleEmail: 'joao.silva@email.com',
  responsiblePhone: '(11) 98765-4321',
  cnpj: '12.345.678/0001-90',
  companyName: 'Acme Corp Finance',
  tradingName: 'Acme Corp',
  cnae: '4711302',
  mcc: '5411',
  mccLabel: 'Supermercados e Mercearias',
  pixKey: 'joao.silva@email.com',
  bankName: 'Banco do Brasil',
  bankAgency: '1234',
  bankAccount: '56789-0',
  bankAccountType: 'CC',
  zipCode: '01001-000',
  street: 'Praça da Sé',
  number: '1',
  complement: 'Lado ímpar',
  neighborhood: 'Sé',
  city: 'São Paulo',
  state: 'SP',
  date: '12 Mar 2026',
};

type StatusAction = 'APPROVED' | 'SUSPENDED' | 'REJECTED';

const ACTION_CONFIG: Record<StatusAction, { label: string; title: string; description: string; placeholder: string; btnClass: string }> = {
  APPROVED: {
    label: '✓ Aprovar',
    title: 'Aprovar Cadastro',
    description: 'Ao aprovar, o cliente será habilitado para operar na plataforma. Adicione um comentário para registrar a justificativa.',
    placeholder: 'Ex: Documentação verificada e aprovada conforme política de cadastro.',
    btnClass: 'btnApprove',
  },
  SUSPENDED: {
    label: '⏸ Suspender',
    title: 'Suspender Cliente',
    description: 'O cliente será temporariamente impedido de realizar operações. Informe o motivo da suspensão.',
    placeholder: 'Ex: Inconsistências identificadas no extrato. Aguardando esclarecimentos.',
    btnClass: 'btnSuspend',
  },
  REJECTED: {
    label: '✕ Reprovar',
    title: 'Reprovar Cadastro',
    description: 'O cadastro será reprovado e o cliente será notificado. Informe o motivo da reprovação.',
    placeholder: 'Ex: Documentação incompleta. CNPJ inativo na Receita Federal.',
    btnClass: 'btnReject',
  },
};

export default function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [client, setClient] = useState(MOCK_CLIENT);
  const [actionModal, setActionModal] = useState<{ action: StatusAction; comment: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const openAction = (action: StatusAction) => setActionModal({ action, comment: '' });
  const closeAction = () => { if (!actionLoading) setActionModal(null); };

  const handleAction = async () => {
    if (!actionModal || !actionModal.comment.trim()) return;
    setActionLoading(true);
    try {
      // TODO: replace with real API call
      // await fetch(`/api/clients/${id}/status`, {
      //   method: 'PATCH',
      //   body: JSON.stringify({ status: actionModal.action, comment: actionModal.comment }),
      // });
      await new Promise(r => setTimeout(r, 600)); // mock delay
      const statusLabel: Record<StatusAction, string> = { APPROVED: 'Aprovado', SUSPENDED: 'Suspenso', REJECTED: 'Reprovado' };
      setClient(c => ({ ...c, status: statusLabel[actionModal.action] }));
      setActionModal(null);
    } finally {
      setActionLoading(false);
    }
  };

  const cfg = actionModal ? ACTION_CONFIG[actionModal.action] : null;

  const statusClass: Record<string, string> = {
    Pendente: styles.statusPending,
    Aprovado: styles.statusApproved,
    Suspenso: styles.statusSuspended,
    Reprovado: styles.statusRejected,
  };

  return (
    <div className={styles.detailsContainer}>
      <div className={styles.header}>
        <div>
          <div className={styles.titleWrapper}>
            <h1 className="title">{client.companyName}</h1>
            <span className={`${styles.statusBadge} ${statusClass[client.status] ?? styles.statusPending}`}>{client.status}</span>
            {client.isPep && <span className={styles.pepBadge}>PEP</span>}
          </div>
          <p className="subtitle">ID do Cliente: #{id} • Cadastrado em {client.date}</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/clients" className={styles.btnBack}>← Voltar</Link>
          {client.status !== 'Aprovado' && (
            <button className={styles.btnApprove} onClick={() => openAction('APPROVED')}>✓ Aprovar</button>
          )}
          {client.status !== 'Suspenso' && client.status !== 'Reprovado' && (
            <button className={styles.btnSuspend} onClick={() => openAction('SUSPENDED')}>⏸ Suspender</button>
          )}
          {client.status !== 'Reprovado' && (
            <button className={styles.btnReject} onClick={() => openAction('REJECTED')}>✕ Reprovar</button>
          )}
        </div>
      </div>

      <div className={styles.contentGrid}>

        {/* Company Data */}
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <span className={styles.icon}>🏢</span>
            <h2>Dados Empresariais</h2>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoGroup}>
              <label>Razão Social</label>
              <p>{client.companyName}</p>
            </div>
            <div className={styles.infoGroup}>
              <label>Nome Fantasia</label>
              <p>{client.tradingName}</p>
            </div>
            <div className={styles.infoGroup}>
              <label>CNPJ</label>
              <p style={{ fontFamily: 'monospace' }}>{client.cnpj}</p>
            </div>
            <div className={styles.infoGroup}>
              <label>CNAE Principal</label>
              <p>{client.cnae || '—'}</p>
            </div>
            <div className={styles.infoGroup}>
              <label>MCC — Código de Categoria</label>
              <p>
                {client.mcc ? (
                  <><strong>{client.mcc}</strong>{client.mccLabel ? ` — ${client.mccLabel}` : ''}</>
                ) : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Personal Data */}
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <span className={styles.icon}>👤</span>
            <h2>Dados do Titular / Sócio</h2>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoGroup}>
              <label>Nome Completo</label>
              <p>{client.fullName}</p>
            </div>
            <div className={styles.infoGroup}>
              <label>CPF</label>
              <p style={{ fontFamily: 'monospace' }}>{client.cpf}</p>
            </div>
            <div className={`${styles.infoGroup} ${styles.fullWidth}`}>
              <label>
                PEP — Pessoa Exposta Politicamente{' '}
                <small style={{ fontWeight: 400, fontSize: '0.75em', color: 'var(--text-muted)' }}>
                  (cargo público, mandato ou função de relevância nos últimos 5 anos)
                </small>
              </label>
              <p>
                {client.isPep
                  ? <span className={styles.pepBadge}>Sim — PEP</span>
                  : <span className={styles.pepNoBadge}>Não declarado</span>
                }
              </p>
              {client.isPep && client.pepPersons.length > 0 && (
                <div className={styles.pepPersonsList}>
                  {client.pepPersons.map((p, i) => (
                    <div key={i} className={styles.pepPersonItem}>
                      <span>{p.nome}</span>
                      <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{p.cpf}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Responsible Data */}
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <span className={styles.icon}>📞</span>
            <h2>Contato Responsável</h2>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoGroup}>
              <label>Nome</label>
              <p>{client.responsibleName}</p>
            </div>
            <div className={styles.infoGroup}>
              <label>E-mail</label>
              <p>{client.responsibleEmail}</p>
            </div>
            <div className={styles.infoGroup}>
              <label>Telefone</label>
              <p>{client.responsiblePhone}</p>
            </div>
          </div>
        </div>

        {/* Banking Data */}
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <span className={styles.icon}>🏦</span>
            <h2>Dados Bancários</h2>
          </div>
          <div className={styles.cardBody}>
            <div className={`${styles.infoGroup} ${styles.fullWidth}`}>
              <label>Chave PIX</label>
              <p>{client.pixKey || '—'}</p>
            </div>
            <div className={styles.infoGroup}>
              <label>Banco</label>
              <p>{client.bankName || '—'}</p>
            </div>
            <div className={styles.infoGroup}>
              <label>Tipo de Conta</label>
              <p>{client.bankAccountType === 'CC' ? 'Conta Corrente' : client.bankAccountType === 'CP' ? 'Conta Poupança' : '—'}</p>
            </div>
            <div className={styles.infoGroup}>
              <label>Agência</label>
              <p>{client.bankAgency || '—'}</p>
            </div>
            <div className={styles.infoGroup}>
              <label>Número da Conta</label>
              <p>{client.bankAccount || '—'}</p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <span className={styles.icon}>📍</span>
            <h2>Localização</h2>
          </div>
          <div className={styles.cardBody}>
            <div className={`${styles.infoGroup} ${styles.fullWidth}`}>
              <label>Endereço</label>
              <p>{client.street}, {client.number}{client.complement ? ` - ${client.complement}` : ''}</p>
            </div>
            <div className={styles.infoGroup}>
              <label>Bairro</label>
              <p>{client.neighborhood}</p>
            </div>
            <div className={styles.infoGroup}>
              <label>Cidade / UF</label>
              <p>{client.city} - {client.state}</p>
            </div>
            <div className={styles.infoGroup}>
              <label>CEP</label>
              <p>{client.zipCode}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Status Action Modal */}
      {actionModal && cfg && (
        <div className={styles.modalOverlay} onClick={closeAction}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{cfg.title}</h3>
              <button className={styles.modalClose} onClick={closeAction} disabled={actionLoading}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalDescription}>{cfg.description}</p>
              <label className={styles.modalLabel}>
                Comentário <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <textarea
                className={styles.modalTextarea}
                rows={4}
                placeholder={cfg.placeholder}
                value={actionModal.comment}
                onChange={e => setActionModal(a => a ? { ...a, comment: e.target.value } : a)}
                disabled={actionLoading}
                autoFocus
              />
              {actionModal.comment.trim().length === 0 && (
                <p className={styles.modalHint}>O comentário é obrigatório para registrar a ação.</p>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnModalCancel} onClick={closeAction} disabled={actionLoading}>
                Cancelar
              </button>
              <button
                className={styles[cfg.btnClass as keyof typeof styles]}
                onClick={handleAction}
                disabled={actionLoading || !actionModal.comment.trim()}
              >
                {actionLoading ? 'Salvando...' : cfg.title}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
