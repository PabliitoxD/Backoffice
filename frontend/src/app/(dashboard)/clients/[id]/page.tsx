import Link from 'next/link';
import styles from './clientDetails.module.css';

const MOCK_CLIENT = {
  id: 1,
  status: 'Pendente',
  fullName: 'João Silva',
  cpf: '123.456.789-00',
  birthDate: '1985-06-15',
  isPep: false,
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

export default async function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = MOCK_CLIENT;

  return (
    <div className={styles.detailsContainer}>
      <div className={styles.header}>
        <div>
          <div className={styles.titleWrapper}>
            <h1 className="title">{client.companyName}</h1>
            <span className={`${styles.statusBadge} ${styles.statusPending}`}>{client.status}</span>
            {client.isPep && (
              <span className={styles.pepBadge}>PEP</span>
            )}
          </div>
          <p className="subtitle">ID do Cliente: #{id} • Cadastrado em {client.date}</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/clients" className={styles.btnBack}>← Voltar</Link>
          <button className={styles.btnApprove}>✓ Aprovar Cadastro</button>
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
            <div className={styles.infoGroup}>
              <label>Data de Nascimento</label>
              <p>{new Date(client.birthDate).toLocaleDateString('pt-BR')}</p>
            </div>
            <div className={`${styles.infoGroup} ${styles.fullWidth}`}>
              <label>Pessoa Exposta Politicamente (PEP)</label>
              <p>
                {client.isPep
                  ? <span className={styles.pepBadge}>Sim — PEP</span>
                  : <span className={styles.pepNoBadge}>Não declarado</span>
                }
              </p>
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
    </div>
  );
}
