"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from './clients.module.css';
import { ClientDetailModal } from '@/components/clients/ClientDetailModal';

const MOCK_CLIENTS = [
  { id: 1, name: 'João Silva',      email: 'joao.silva@email.com', company: 'Acme Corp',      document: '12.345.678/0001-90', status: 'Ativo',    date: '12 Mar 2026' },
  { id: 2, name: 'Maria Oliveira',  email: 'maria.ol@email.com',   company: 'Tech Solutions',  document: '98.765.432/0001-10', status: 'Pendente', date: '12 Mar 2026' },
  { id: 3, name: 'Carlos Souza',    email: 'csouza@email.com',     company: 'Global Finance',  document: '11.222.333/0001-44', status: 'Ativo',    date: '11 Mar 2026' },
  { id: 4, name: 'Ana Pereira',     email: 'anap@email.com',       company: 'Retail Hub',      document: '55.666.777/0001-88', status: 'Inativo',  date: '10 Mar 2026' },
  { id: 5, name: 'Roberto Firmino', email: 'betofirm@email.com',   company: 'Logistics Pro',   document: '33.444.555/0001-22', status: 'Ativo',    date: '09 Mar 2026' },
];

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [selectedClient, setSelectedClient] = useState<typeof MOCK_CLIENTS[0] | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = MOCK_CLIENTS.filter(c => {
    const term = search.toLowerCase().trim();
    const matchesSearch = !term ||
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.company.toLowerCase().includes(term) ||
      c.document.replace(/\D/g, '').includes(term.replace(/\D/g, '')) ||
      c.document.toLowerCase().includes(term);
    const matchesStatus = !statusFilter || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function openDetail(client: typeof MOCK_CLIENTS[0]) {
    setOpenDropdownId(null);
    setSelectedClient(client);
  }

  return (
    <div className={styles.usersContainer}>
      <div className={styles.header}>
        <div>
          <h1 className="title">Gerenciamento de Clientes</h1>
          <p className="subtitle">Visualize informações detalhadas e status dos clientes cadastrados via plataforma.</p>
        </div>
        <Link href="/clients/new" className={styles.btnAdd} style={{ textDecoration: 'none' }}>
          <span className={styles.iconPlus}>+</span> Novo Cliente
        </Link>
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
          <input
            type="text"
            placeholder="Buscar por nome, empresa, e-mail ou CNPJ..."
            className={styles.searchInput}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className={styles.filters}>
            <select className={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">Todos os Status</option>
              <option value="Ativo">Ativo</option>
              <option value="Pendente">Pendente</option>
              <option value="Inativo">Inativo</option>
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
                <th>CNPJ</th>
                <th>Status</th>
                <th>Data de Cadastro</th>
                <th className={styles.textRight}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
              {filtered.map((client) => (
                <tr key={client.id}>
                  <td className={styles.fontWeightMedium}>{client.name}</td>
                  <td className={styles.textMuted}>{client.email}</td>
                  <td>{client.company}</td>
                  <td className={styles.textMuted} style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{client.document}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${
                      client.status === 'Ativo' ? styles.statusActive :
                      client.status === 'Pendente' ? styles.statusPending :
                      styles.statusInactive
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className={styles.textMuted}>{client.date}</td>
                  <td className={styles.actionsCell}>
                    <div className={styles.dropdownContainer} ref={openDropdownId === client.id ? dropdownRef : null}>
                      <button
                        className={styles.btnActionDots}
                        onClick={() => setOpenDropdownId(openDropdownId === client.id ? null : client.id)}
                        title="Ações"
                      >
                        ⋮
                      </button>
                      {openDropdownId === client.id && (
                        <div className={styles.dropdownMenu}>
                          <button className={styles.dropdownItem} onClick={() => openDetail(client)}>
                            👁️ Ver Detalhes
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <span className={styles.paginationText}>Mostrando {filtered.length} de {MOCK_CLIENTS.length} clientes</span>
          <div className={styles.paginationControls}>
            <button className={styles.btnPage} disabled>Anterior</button>
            <button className={`${styles.btnPage} ${styles.btnPageActive}`}>1</button>
            <button className={styles.btnPage} disabled>Próxima</button>
          </div>
        </div>
      </div>

      <ClientDetailModal client={selectedClient} onClose={() => setSelectedClient(null)} />
    </div>
  );
}
