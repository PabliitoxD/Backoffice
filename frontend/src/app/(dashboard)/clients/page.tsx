"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from './clients.module.css';
import { ClientModal } from '@/components/clients/ClientModal';

// MOCK DATA: Will be replaced by an API endpoint later
const MOCK_CLIENTS = [
  { id: 1, name: 'João Silva',       email: 'joao.silva@email.com', company: 'Acme Corp',      status: 'Ativo',    date: '12 Mar 2026' },
  { id: 2, name: 'Maria Oliveira',   email: 'maria.ol@email.com',   company: 'Tech Solutions',  status: 'Pendente', date: '12 Mar 2026' },
  { id: 3, name: 'Carlos Souza',     email: 'csouza@email.com',     company: 'Global Finance',  status: 'Ativo',    date: '11 Mar 2026' },
  { id: 4, name: 'Ana Pereira',      email: 'anap@email.com',       company: 'Retail Hub',      status: 'Inativo',  date: '10 Mar 2026' },
  { id: 5, name: 'Roberto Firmino',  email: 'betofirm@email.com',   company: 'Logistics Pro',   status: 'Ativo',    date: '09 Mar 2026' },
];

type Client = typeof MOCK_CLIENTS[number];

export default function ClientsPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  return (
    <div className={styles.usersContainer}>
      <div className={styles.header}>
        <div>
          <h1 className="title">Gerenciamento de Clientes</h1>
          <p className="subtitle">Visualize informações detalhadas e status dos clientes cadastrados via plataforma.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/clients/new" className={styles.btnAdd} style={{ textDecoration: 'none' }}>
            <span className={styles.iconPlus}>+</span> Novo Cliente
          </Link>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Total de Clientes</h3>
          <div className={styles.statValue}>1.248</div>
          <div className={styles.statChange}>
            <span className={styles.statChangePositive}>↑ 12%</span>
            <span className={styles.textMuted}>vs último mês</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Novos Clientes (30 dias)</h3>
          <div className={styles.statValue}>142</div>
          <div className={styles.statChange}>
            <span className={styles.statChangePositive}>↑ 8%</span>
            <span className={styles.textMuted}>vs mês anterior</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <h3 className={styles.statTitle}>Clientes Ativos</h3>
          <div className={styles.statValue}>1.120</div>
          <div className={styles.statChange}>
            <span className={styles.statChangePositive}>↑ 4%</span>
            <span className={styles.textMuted}>vs último mês</span>
          </div>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableToolbar}>
          <input type="text" placeholder="Buscar cliente por nome, empresa ou email..." className={styles.searchInput} />
          <div className={styles.filters}>
            <select className={styles.filterSelect}>
              <option value="">Todos os Status</option>
              <option value="active">Ativo</option>
              <option value="pending">Pendente</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Empresa</th>
                <th>Status</th>
                <th>Data de Cadastro</th>
                <th className={styles.textRight}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CLIENTS.map((client) => (
                <tr key={client.id}>
                  <td className={styles.fontWeightMedium}>{client.name}</td>
                  <td className={styles.textMuted}>{client.email}</td>
                  <td>{client.company}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        client.status === 'Ativo'    ? styles.statusActive   :
                        client.status === 'Pendente' ? styles.statusPending  :
                        styles.statusInactive
                      }`}
                    >
                      {client.status}
                    </span>
                  </td>
                  <td className={styles.textMuted}>{client.date}</td>
                  <td className={styles.actionsCell}>
                    <button
                      className={styles.btnVerDetalhe}
                      onClick={() => setSelectedClient(client)}
                    >
                      Ver Detalhe
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <span className={styles.paginationText}>Mostrando 1 a 5 de 5 clientes</span>
          <div className={styles.paginationControls}>
            <button className={styles.btnPage} disabled>Anterior</button>
            <button className={`${styles.btnPage} ${styles.btnPageActive}`}>1</button>
            <button className={styles.btnPage} disabled>Próxima</button>
          </div>
        </div>
      </div>

      <ClientModal
        client={selectedClient}
        isOpen={selectedClient !== null}
        onClose={() => setSelectedClient(null)}
      />
    </div>
  );
}
