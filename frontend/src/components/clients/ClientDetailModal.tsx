"use client";

import { useState, useEffect } from 'react';
import styles from './clientDetailModal.module.css';

type ClientBasic = {
  id: number;
  name: string;
  email: string;
  company: string;
  document: string;
  status: string;
  date: string;
};

type Tab = 'detalhes' | 'editar' | 'extrato' | 'plano';

const PAGE_SIZE = 10;

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'APPROVED':
    case 'COMPLETED':
      return { cls: styles.statusApproved, label: 'Aprovada' };
    case 'WAITING':
    case 'PENDING':
      return { cls: styles.statusWaiting, label: 'Aguardando' };
    case 'REFUSED':
      return { cls: styles.statusRefused, label: 'Recusada' };
    default:
      return { cls: styles.statusReversed, label: 'Chargeback' };
  }
};

// Extended mock data keyed by client id
const MOCK_DETAIL: Record<number, any> = {
  1: {
    fullName: 'João Silva', cpf: '123.456.789-00', birthDate: '1985-06-15',
    isPep: true,
    pepName: 'João Silva', pepCpf: '123.456.789-00', pepBirthDate: '1985-06-15',
    responsibleName: 'João Silva', responsibleEmail: 'joao.silva@email.com', responsiblePhone: '(11) 98765-4321',
    cnpj: '12.345.678/0001-90', companyName: 'Acme Corp Finance', tradingName: 'Acme Corp',
    cnae: '4711302', mcc: '5411', mccLabel: 'Supermercados e Mercearias',
    pixKey: 'joao.silva@email.com', bankName: 'Banco do Brasil', bankAgency: '1234',
    bankAccount: '56789-0', bankAccountType: 'CC',
    zipCode: '01001-000', street: 'Praça da Sé', number: '1', complement: 'Lado ímpar',
    neighborhood: 'Sé', city: 'São Paulo', state: 'SP',
    plan: { name: 'Plano Pro', pixRate: '1,50%', cardRate: '2,99%', boletoFee: 'R$ 3,49', withdrawFee: 'R$ 5,00', monthlyLimit: 'R$ 50.000,00' },
  },
};

function getDetail(client: ClientBasic) {
  return MOCK_DETAIL[client.id] ?? {
    fullName: client.name, cpf: '—', birthDate: '',
    isPep: false, pepName: '', pepCpf: '', pepBirthDate: '',
    responsibleName: client.name, responsibleEmail: client.email, responsiblePhone: '—',
    cnpj: client.document, companyName: client.company, tradingName: client.company,
    cnae: '—', mcc: '—', mccLabel: '',
    pixKey: '—', bankName: '—', bankAgency: '—', bankAccount: '—', bankAccountType: '',
    zipCode: '—', street: '—', number: '—', complement: '', neighborhood: '—', city: '—', state: '—',
    plan: { name: '—', pixRate: '—', cardRate: '—', boletoFee: '—', withdrawFee: '—', monthlyLimit: '—' },
  };
}

// ── DetalhesTab ───────────────────────────────────────────

function DetalhesTab({ detail }: { detail: any }) {
  return (
    <div className={styles.infoGrid}>
      {/* Empresa */}
      <div className={styles.infoCard}>
        <div className={styles.infoCardHeader}>Dados Empresariais</div>
        <div className={styles.infoCardBody}>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>Razão Social</span>
            <p className={styles.infoValue}>{detail.companyName}</p>
          </div>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>Nome Fantasia</span>
            <p className={styles.infoValue}>{detail.tradingName}</p>
          </div>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>CNPJ</span>
            <p className={styles.infoValue} style={{ fontFamily: 'monospace' }}>{detail.cnpj}</p>
          </div>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>CNAE</span>
            <p className={styles.infoValue}>{detail.cnae || '—'}</p>
          </div>
          <div className={styles.infoGroupFull}>
            <span className={styles.infoLabel}>MCC — Código de Categoria</span>
            <p className={styles.infoValue}>
              {detail.mcc
                ? <><strong>{detail.mcc}</strong>{detail.mccLabel ? ` — ${detail.mccLabel}` : ''}</>
                : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Titular */}
      <div className={styles.infoCard}>
        <div className={styles.infoCardHeader}>Dados do Titular</div>
        <div className={styles.infoCardBody}>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>Nome Completo</span>
            <p className={styles.infoValue}>{detail.fullName}</p>
          </div>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>CPF</span>
            <p className={styles.infoValue} style={{ fontFamily: 'monospace' }}>{detail.cpf}</p>
          </div>
          {detail.birthDate && (
            <div className={styles.infoGroup}>
              <span className={styles.infoLabel}>Nascimento</span>
              <p className={styles.infoValue}>{new Date(detail.birthDate).toLocaleDateString('pt-BR')}</p>
            </div>
          )}
          {/* PEP */}
          <div className={styles.infoGroupFull}>
            <span className={styles.infoLabel}>Pessoa Exposta Politicamente (PEP)</span>
            <p className={styles.infoValue}>
              {detail.isPep
                ? <span className={styles.pepBadge}>Sim — PEP</span>
                : <span className={styles.textMuted}>Não declarado</span>}
            </p>
          </div>
          {detail.isPep && (detail.pepName || detail.pepCpf || detail.pepBirthDate) && (
            <div className={styles.pepBlock}>
              <p className={styles.pepBlockTitle}>Dados da Pessoa Exposta</p>
              {detail.pepName && (
                <div className={styles.infoGroup}>
                  <span className={styles.infoLabel}>Nome Completo</span>
                  <p className={styles.infoValue}>{detail.pepName}</p>
                </div>
              )}
              {detail.pepCpf && (
                <div className={styles.infoGroup}>
                  <span className={styles.infoLabel}>CPF</span>
                  <p className={styles.infoValue} style={{ fontFamily: 'monospace' }}>{detail.pepCpf}</p>
                </div>
              )}
              {detail.pepBirthDate && (
                <div className={styles.infoGroup}>
                  <span className={styles.infoLabel}>Nascimento</span>
                  <p className={styles.infoValue}>{new Date(detail.pepBirthDate).toLocaleDateString('pt-BR')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contato */}
      <div className={styles.infoCard}>
        <div className={styles.infoCardHeader}>Contato Responsável</div>
        <div className={styles.infoCardBody}>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>Nome</span>
            <p className={styles.infoValue}>{detail.responsibleName}</p>
          </div>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>Telefone</span>
            <p className={styles.infoValue}>{detail.responsiblePhone}</p>
          </div>
          <div className={styles.infoGroupFull}>
            <span className={styles.infoLabel}>E-mail</span>
            <p className={styles.infoValue}>{detail.responsibleEmail}</p>
          </div>
        </div>
      </div>

      {/* Bancário */}
      <div className={styles.infoCard}>
        <div className={styles.infoCardHeader}>Dados Bancários</div>
        <div className={styles.infoCardBody}>
          <div className={styles.infoGroupFull}>
            <span className={styles.infoLabel}>Chave PIX</span>
            <p className={styles.infoValue}>{detail.pixKey || '—'}</p>
          </div>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>Banco</span>
            <p className={styles.infoValue}>{detail.bankName || '—'}</p>
          </div>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>Tipo de Conta</span>
            <p className={styles.infoValue}>
              {detail.bankAccountType === 'CC' ? 'Conta Corrente'
                : detail.bankAccountType === 'CP' ? 'Conta Poupança'
                : '—'}
            </p>
          </div>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>Agência</span>
            <p className={styles.infoValue}>{detail.bankAgency || '—'}</p>
          </div>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>Número da Conta</span>
            <p className={styles.infoValue}>{detail.bankAccount || '—'}</p>
          </div>
        </div>
      </div>

      {/* Endereço — ocupa as 2 colunas */}
      <div className={`${styles.infoCard} ${styles.infoCardFull}`}>
        <div className={styles.infoCardHeader}>Localização</div>
        <div className={styles.infoCardBody}>
          <div className={styles.infoGroupFull}>
            <span className={styles.infoLabel}>Endereço</span>
            <p className={styles.infoValue}>
              {detail.street}, {detail.number}{detail.complement ? ` — ${detail.complement}` : ''}
            </p>
          </div>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>Bairro</span>
            <p className={styles.infoValue}>{detail.neighborhood}</p>
          </div>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>Cidade / UF</span>
            <p className={styles.infoValue}>{detail.city} — {detail.state}</p>
          </div>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>CEP</span>
            <p className={styles.infoValue}>{detail.zipCode}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── EditarTab ─────────────────────────────────────────────

function EditarTab({ detail, onClose }: { detail: any; onClose: () => void }) {
  const [form, setForm] = useState({
    companyName:       detail.companyName       ?? '',
    tradingName:       detail.tradingName       ?? '',
    cnpj:              detail.cnpj              ?? '',
    cnae:              detail.cnae              ?? '',
    mcc:               detail.mcc               ?? '',
    fullName:          detail.fullName          ?? '',
    cpf:               detail.cpf               ?? '',
    responsiblePhone:  detail.responsiblePhone  ?? '',
    responsibleEmail:  detail.responsibleEmail  ?? '',
    pixKey:            detail.pixKey            ?? '',
    bankName:          detail.bankName          ?? '',
    bankAgency:        detail.bankAgency        ?? '',
    bankAccount:       detail.bankAccount       ?? '',
    bankAccountType:   detail.bankAccountType   ?? '',
    isPep:             detail.isPep             ?? false,
    pepName:           detail.pepName           ?? '',
    pepCpf:            detail.pepCpf            ?? '',
    pepBirthDate:      detail.pepBirthDate      ?? '',
    street:            detail.street            ?? '',
    number:            detail.number            ?? '',
    complement:        detail.complement        ?? '',
    neighborhood:      detail.neighborhood      ?? '',
    city:              detail.city              ?? '',
    state:             detail.state             ?? '',
    zipCode:           detail.zipCode           ?? '',
  });

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <form className={styles.editForm} onSubmit={e => e.preventDefault()}>
      {/* Dados Empresariais */}
      <div className={styles.editSection}>
        <p className={styles.editSectionTitle}>Dados Empresariais</p>
        <div className={styles.editGrid}>
          <div className={styles.formGroup}>
            <label>Razão Social</label>
            <input value={form.companyName} onChange={set('companyName')} />
          </div>
          <div className={styles.formGroup}>
            <label>Nome Fantasia</label>
            <input value={form.tradingName} onChange={set('tradingName')} />
          </div>
          <div className={styles.formGroup}>
            <label>CNPJ</label>
            <input value={form.cnpj} onChange={set('cnpj')} style={{ fontFamily: 'monospace' }} />
          </div>
          <div className={styles.formGroup}>
            <label>CNAE</label>
            <input value={form.cnae} onChange={set('cnae')} />
          </div>
          <div className={styles.formGroup}>
            <label>MCC</label>
            <input value={form.mcc} onChange={set('mcc')} />
          </div>
        </div>
      </div>

      {/* Dados do Titular */}
      <div className={styles.editSection}>
        <p className={styles.editSectionTitle}>Dados do Titular</p>
        <div className={styles.editGrid}>
          <div className={styles.formGroup}>
            <label>Nome Completo</label>
            <input value={form.fullName} onChange={set('fullName')} />
          </div>
          <div className={styles.formGroup}>
            <label>CPF</label>
            <input value={form.cpf} onChange={set('cpf')} style={{ fontFamily: 'monospace' }} />
          </div>
          <div className={styles.formGroup}>
            <label>Telefone</label>
            <input value={form.responsiblePhone} onChange={set('responsiblePhone')} />
          </div>
          <div className={styles.formGroup}>
            <label>E-mail</label>
            <input value={form.responsibleEmail} onChange={set('responsibleEmail')} />
          </div>

          {/* PEP checkbox */}
          <div className={styles.pepCheckRow}>
            <input
              type="checkbox"
              id="isPep"
              checked={form.isPep}
              onChange={e => setForm(f => ({ ...f, isPep: e.target.checked }))}
            />
            <label htmlFor="isPep">Pessoa Exposta Politicamente (PEP)</label>
          </div>

          {/* PEP sub-fields — visíveis apenas quando PEP está marcado */}
          {form.isPep && (
            <div className={styles.pepSubFields}>
              <p className={styles.pepSubLabel}>Dados da Pessoa Exposta</p>
              <div className={styles.formGroup}>
                <label>Nome Completo</label>
                <input value={form.pepName} onChange={set('pepName')} placeholder="Nome da pessoa exposta" />
              </div>
              <div className={styles.formGroup}>
                <label>CPF</label>
                <input value={form.pepCpf} onChange={set('pepCpf')} placeholder="000.000.000-00" style={{ fontFamily: 'monospace' }} />
              </div>
              <div className={styles.formGroup}>
                <label>Nascimento</label>
                <input type="date" value={form.pepBirthDate} onChange={set('pepBirthDate')} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dados Bancários */}
      <div className={styles.editSection}>
        <p className={styles.editSectionTitle}>Dados Bancários</p>
        <div className={styles.editGrid}>
          <div className={styles.editGridFull}>
            <div className={styles.formGroup}>
              <label>Chave PIX</label>
              <input value={form.pixKey} onChange={set('pixKey')} />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Banco</label>
            <input value={form.bankName} onChange={set('bankName')} />
          </div>
          <div className={styles.formGroup}>
            <label>Tipo de Conta</label>
            <select value={form.bankAccountType} onChange={set('bankAccountType')}>
              <option value="">Selecione</option>
              <option value="CC">Conta Corrente</option>
              <option value="CP">Conta Poupança</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Agência</label>
            <input value={form.bankAgency} onChange={set('bankAgency')} />
          </div>
          <div className={styles.formGroup}>
            <label>Número da Conta</label>
            <input value={form.bankAccount} onChange={set('bankAccount')} />
          </div>
        </div>
      </div>

      {/* Localização */}
      <div className={styles.editSection}>
        <p className={styles.editSectionTitle}>Localização</p>
        <div className={styles.editGrid}>
          <div className={styles.formGroup}>
            <label>Logradouro</label>
            <input value={form.street} onChange={set('street')} />
          </div>
          <div className={styles.formGroup}>
            <label>Número</label>
            <input value={form.number} onChange={set('number')} />
          </div>
          <div className={styles.formGroup}>
            <label>Complemento</label>
            <input value={form.complement} onChange={set('complement')} />
          </div>
          <div className={styles.formGroup}>
            <label>Bairro</label>
            <input value={form.neighborhood} onChange={set('neighborhood')} />
          </div>
          <div className={styles.formGroup}>
            <label>Cidade</label>
            <input value={form.city} onChange={set('city')} />
          </div>
          <div className={styles.formGroup}>
            <label>UF</label>
            <input value={form.state} onChange={set('state')} maxLength={2} />
          </div>
          <div className={styles.formGroup}>
            <label>CEP</label>
            <input value={form.zipCode} onChange={set('zipCode')} />
          </div>
        </div>
      </div>

      <div className={styles.editActions}>
        <button type="button" className={styles.btnCancel} onClick={onClose}>Cancelar</button>
        <button type="submit" className={styles.btnSave}>Salvar Alterações</button>
      </div>
    </form>
  );
}

// ── ExtratoTab ────────────────────────────────────────────

function ExtratoTab({ clientId }: { clientId: number }) {
  const [statement, setStatement] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    fetch(`http://localhost:3001/producers/${clientId}/statement`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setStatement(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [clientId]);

  const totalPages = Math.max(1, Math.ceil(statement.length / PAGE_SIZE));
  const pageItems = statement.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    approved: statement
      .filter(s => s.type === 'TRANSACTION' && ['APPROVED', 'COMPLETED'].includes(s.status))
      .reduce((a, c) => a + c.amount, 0),
    processing: statement
      .filter(s => ['WAITING', 'PENDING'].includes(s.status))
      .reduce((a, c) => a + Math.abs(c.amount), 0),
    withdrawn: statement
      .filter(s => s.type === 'WITHDRAWAL' && s.status === 'COMPLETED')
      .reduce((a, c) => a + Math.abs(c.amount), 0),
  };

  return (
    <div>
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <p className={styles.statTitle}>Total Aprovado</p>
          <p className={`${styles.statValue} ${styles.statPositive}`}>{formatCurrency(stats.approved)}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statTitle}>Em Processamento</p>
          <p className={styles.statValue}>{formatCurrency(stats.processing)}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statTitle}>Total Sacado</p>
          <p className={`${styles.statValue} ${styles.statNegative}`}>{formatCurrency(stats.withdrawn)}</p>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
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
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    Nenhuma movimentação encontrada.
                  </td>
                </tr>
              ) : (
                pageItems.map(item => {
                  const badge = getStatusBadge(item.status);
                  return (
                    <tr key={item.id}>
                      <td className={styles.textMuted}>
                        {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className={`${styles.fontMedium} ${styles.monoSm}`}>
                        #{item.id.slice(-6).toUpperCase()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{item.description}</span>
                          {item.customerName && (
                            <small className={styles.textMuted} style={{ fontSize: '0.75rem' }}>
                              {item.customerName}
                            </small>
                          )}
                        </div>
                      </td>
                      <td className={styles.textMuted}>
                        {item.type === 'TRANSACTION' ? 'Venda' : 'Saque'}
                      </td>
                      <td
                        style={{ fontWeight: 600 }}
                        className={item.amount >= 0 ? styles.statPositive : styles.statNegative}
                      >
                        {formatCurrency(item.amount)}
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${badge.cls}`}>{badge.label}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {!loading && (
        <div className={styles.pagination}>
          <span className={styles.paginationText}>
            {statement.length === 0
              ? 'Nenhuma movimentação'
              : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, statement.length)} de ${statement.length} movimentações`}
          </span>
          <div className={styles.paginationControls}>
            <button className={styles.btnPage} disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`${styles.btnPage} ${page === i + 1 ? styles.btnPageActive : ''}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button className={styles.btnPage} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PlanoTab ──────────────────────────────────────────────

function PlanoTab({ plan }: { plan: any }) {
  return (
    <div className={styles.infoGrid}>
      {/* Identificação do Plano */}
      <div className={`${styles.infoCard} ${styles.infoCardFull}`}>
        <div className={styles.infoCardHeader}>Plano Operacional</div>
        <div className={styles.infoCardBody} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>Plano Atual</span>
            <p className={`${styles.infoValue} ${styles.planoHighlight}`}>{plan.name}</p>
            <span className={styles.infoSub}>Contrato vigente</span>
          </div>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>Taxa PIX</span>
            <p className={`${styles.infoValue} ${styles.planoHighlight}`}>{plan.pixRate}</p>
            <span className={styles.infoSub}>Por transação aprovada</span>
          </div>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>Taxa Cartão</span>
            <p className={`${styles.infoValue} ${styles.planoHighlight}`}>{plan.cardRate}</p>
            <span className={styles.infoSub}>Crédito e débito</span>
          </div>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>Tarifa Boleto</span>
            <p className={`${styles.infoValue} ${styles.planoHighlight}`}>{plan.boletoFee}</p>
            <span className={styles.infoSub}>Por boleto gerado</span>
          </div>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>Taxa de Saque</span>
            <p className={`${styles.infoValue} ${styles.planoHighlight}`}>{plan.withdrawFee}</p>
            <span className={styles.infoSub}>Por saque processado</span>
          </div>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>Limite Mensal</span>
            <p className={`${styles.infoValue} ${styles.planoHighlight}`}>{plan.monthlyLimit}</p>
            <span className={styles.infoSub}>Volume máximo de TPV</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────

export function ClientDetailModal({
  client,
  onClose,
}: {
  client: ClientBasic | null;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>('detalhes');

  useEffect(() => {
    if (client) setTab('detalhes');
  }, [client?.id]);

  useEffect(() => {
    document.body.style.overflow = client ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [!!client]);

  if (!client) return null;

  const detail = getDetail(client);

  const TABS: { id: Tab; label: string }[] = [
    { id: 'detalhes', label: 'Detalhes do Cliente' },
    { id: 'editar',   label: 'Editar' },
    { id: 'extrato',  label: 'Extrato' },
    { id: 'plano',    label: 'Plano' },
  ];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <div className={styles.titleRow}>
              <h2 className={styles.title}>{detail.companyName}</h2>
              <span className={`${styles.badge} ${
                client.status === 'Ativo'    ? styles.badgeActive   :
                client.status === 'Pendente' ? styles.badgePending  :
                styles.badgeInactive
              }`}>
                {client.status}
              </span>
              {detail.isPep && <span className={styles.pepBadge}>PEP</span>}
            </div>
            <p className={styles.subtitle}>
              CNPJ: {client.document} · Cadastrado em {client.date}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.tabBar}>
          {TABS.map(t => (
            <button
              key={t.id}
              className={`${styles.tabBtn} ${tab === t.id ? styles.tabBtnActive : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className={styles.body}>
          {tab === 'detalhes' && <DetalhesTab detail={detail} />}
          {tab === 'editar'   && <EditarTab detail={detail} onClose={onClose} />}
          {tab === 'extrato'  && <ExtratoTab clientId={client.id} />}
          {tab === 'plano'    && <PlanoTab plan={detail.plan} />}
        </div>
      </div>
    </div>
  );
}
