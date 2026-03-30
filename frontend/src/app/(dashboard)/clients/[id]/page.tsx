import Link from 'next/link';
import styles from './clientDetails.module.css';

// MOCK DATA: Simulating a single client fetch based on the [id] param
const MOCK_CLIENT = {
  id: 1,
  status: 'Pendente', // Required logic: external registrations come as pending
  fullName: 'João Silva',
  cpf: '123.456.789-00',
  birthDate: '1985-06-15',
  responsibleName: 'João Silva',
  responsibleEmail: 'joao.silva@email.com',
  responsiblePhone: '(11) 98765-4321',
  cnpj: '12.345.678/0001-90',
  companyName: 'Acme Corp Finance',
  tradingName: 'Acme Corp',
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
  // In a real application, you'd use `id` to fetch the client data.
  const client = MOCK_CLIENT;

  return (
    <div className={styles.detailsContainer}>
      <div className={styles.header}>
        <div>
          <div className={styles.titleWrapper}>
            <h1 className="title">{client.companyName}</h1>
            <span className={`${styles.statusBadge} ${styles.statusPending}`}>
              {client.status}
            </span>
          </div>
          <p className="subtitle">ID do Cliente: #{id} • Cadastrado em {client.date}</p>
        </div>
        <div className={styles.headerActions}>
           <Link href="/clients" className={styles.btnBack}>
             ← Voltar
           </Link>
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
              <p>{client.cnpj}</p>
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
              <p>{client.cpf}</p>
            </div>
            <div className={styles.infoGroup}>
              <label>Data de Nascimento</label>
              <p>{new Date(client.birthDate).toLocaleDateString('pt-BR')}</p>
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
              <p>{client.street}, {client.number} {client.complement ? `- ${client.complement}` : ''}</p>
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
