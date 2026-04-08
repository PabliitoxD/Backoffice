"use client";

import { useState, useEffect } from 'react';
import styles from './settings.module.css';
import { API_URL } from '@/lib/api';

interface Profile {
  id: string;
  name: string;
  permissions: string[];
  _count?: { users: number };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profileId?: string;
  profile?: { name: string };
  createdAt: string;
}

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  details: Record<string, unknown> | null;
  ip: string;
  createdAt: string;
  user?: { name: string; email: string };
}

const AVAILABLE_PERMISSIONS = [
  { id: 'dashboard:view', label: 'Visualizar Dashboard' },
  { id: 'clients:manage', label: 'Gerenciar Clientes' },
  { id: 'plans:manage', label: 'Gerenciar Planos' },
  { id: 'transactions:manage', label: 'Gerenciar Transações' },
  { id: 'users:manage', label: 'Gerenciar Usuários' },
  { id: 'profiles:manage', label: 'Gerenciar Perfis' },
  { id: 'settings:manage', label: 'Gerenciar Configurações' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'usuario' | 'perfil' | 'perfis' | 'logs'>('usuario');
  const [users, setUsers] = useState<User[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // New User Form State
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    profileId: ''
  });

  // Profile Form State
  const [profileFormData, setProfileFormData] = useState({
    id: '',
    name: '',
    permissions: [] as string[]
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Profile data (current user)
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    role: ''
  });

  useEffect(() => {
    fetchData();
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserProfile(JSON.parse(storedUser));
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [usersRes, profilesRes, logsRes] = await Promise.all([
        fetch(`${API_URL}/users`, { headers, cache: 'no-store' }),
        fetch(`${API_URL}/profiles`, { headers, cache: 'no-store' }),
        fetch(`${API_URL}/audit-logs`, { headers, cache: 'no-store' })
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (profilesRes.ok) setProfiles(await profilesRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
      
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userFormData)
      });
      
      if (res.ok) {
        setIsUserModalOpen(false);
        setUserFormData({ name: '', email: '', password: '', profileId: '' });
        fetchData();
      } else {
        const data = await res.json();
        setFormError(data.message || 'Erro ao criar usuário');
      }
    } catch (err) {
      setFormError('Erro ao conectar com o servidor');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      const token = localStorage.getItem('token');
      const method = profileFormData.id ? 'PUT' : 'POST';
      const url = profileFormData.id ? `${API_URL}/profiles/${profileFormData.id}` : `${API_URL}/profiles`;
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profileFormData.name,
          permissions: profileFormData.permissions
        })
      });
      
      if (res.ok) {
        setIsProfileModalOpen(false);
        setProfileFormData({ id: '', name: '', permissions: [] });
        fetchData();
      } else {
        const data = await res.json();
        setFormError(data.message || 'Erro ao salvar perfil');
      }
    } catch (err) {
      setFormError('Erro ao conectar com o servidor');
    } finally {
      setFormLoading(false);
    }
  };

  const togglePermission = (permissionId: string) => {
    setProfileFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  // Helper to get action label color
  const getActionColor = (action: string) => {
    if (action === 'LOGIN') return '#10b981';
    if (action.startsWith('CREATE')) return '#4f46e5';
    if (action.startsWith('DELETE')) return '#ef4444';
    if (action.startsWith('UPDATE')) return '#f59e0b';
    return 'var(--text-muted)';
  };

  const getActionBg = (action: string) => {
    if (action === 'LOGIN') return 'rgba(16, 185, 129, 0.08)';
    if (action.startsWith('CREATE')) return 'rgba(79, 70, 229, 0.08)';
    if (action.startsWith('DELETE')) return 'rgba(239, 68, 68, 0.08)';
    if (action.startsWith('UPDATE')) return 'rgba(245, 158, 11, 0.08)';
    return 'rgba(100, 116, 139, 0.08)';
  };

  // Human-readable description of what happened
  const getActionDescription = (log: AuditLog): string => {
    const { action, entity, details } = log;
    const d = details as Record<string, unknown> | null;

    if (action === 'LOGIN') return 'Usuário realizou login no sistema.';

    const entityLabel: Record<string, string> = {
      Users: 'usuário',
      Profiles: 'perfil de acesso',
      Transactions: 'transação',
      Clients: 'cliente',
      Plans: 'plano',
      Withdrawals: 'saque',
      Chargebacks: 'chargeback',
    };
    const label = entityLabel[entity] || entity?.toLowerCase() || 'registro';

    // Specialized actions
    if (action.includes('CHARGEBACK_DEFENSE')) {
      const count = d?.filesCount || (Array.isArray(d?.files) ? d.files.length : 0);
      return `Submeteu defesa de chargeback à adquirente com ${count} arquivo(s) anexado(s).`;
    }

    if (action.includes('CHARGEBACK_OBSERVATION')) {
      return `Atualizou as observações internas do chargeback de forma manual.`;
    }

    if (action.includes('EXTRA_CHARGE')) {
      const val = Number(d?.amount) || 0;
      const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
      return `Lançou cobrança extra de ${formatted} para compensação de taxa de chargeback no extrato.`;
    }

    if (action.includes('NOTIFY_FINANCE')) {
      const count = d?.count || (Array.isArray(d?.withdrawalIds) ? d.withdrawalIds.length : 0);
      return `Enviou relatório de transferências PIX ao setor financeiro (${count} saques).`;
    }


    if (action.includes('CHARGEBACK') && !action.includes('OBSERVATION') && !action.includes('DEFENSE')) {
      return `Marcou transação como Chargeback (contestação registrada pela adquirente).`;
    }

    if (action.startsWith('CREATE')) {
      const name = (d?.name as string) || (d?.email as string) || '';
      return name
        ? `Novo ${label} criado: "${name}".`
        : `Um novo ${label} foi criado no sistema.`;
    }

    if (action.startsWith('UPDATE')) {
      const changedFields = d ? Object.keys(d).filter(k => k !== 'id' && k !== 'updatedAt') : [];
      const fieldMap: Record<string, string> = {
        name: 'nome',
        email: 'e-mail',
        password: 'senha',
        permissions: 'permissões',
        profileId: 'perfil de acesso',
        status: 'status',
        observation: 'observação',
        amount: 'valor',
      };
      const readable = changedFields.map(f => fieldMap[f] || f);
      const name = (d?.name as string) || '';
      const base = name ? `${label} "${name}" atualizado` : `${label} atualizado`;
      return readable.length > 0
        ? `${base}. Campos alterados: ${readable.join(', ')}.`
        : `${base}.`;
    }

    if (action.startsWith('DELETE')) {
      return `Um ${label} foi removido do sistema.`;
    }

    return `Ação "${action}" executada sobre ${label}.`;
  };


  const renderTabContent = () => {
    if (activeTab === 'usuario') {
      return (
        <div className={styles.tabContent}>
          <div className={styles.tableCard}>
            <div className={styles.tableToolbar}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Usuários do Sistema</h2>
              <button className={styles.btnAdd} onClick={() => setIsUserModalOpen(true)}>
                <span>+</span> Novo Usuário
              </button>
            </div>

            {loading ? (
              <div className={styles.loading}>Carregando usuários...</div>
            ) : error ? (
              <div className={styles.error} style={{ padding: '1.5rem', textAlign: 'center' }}>{error}</div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Perfil</th>
                      <th>Data de Cadastro</th>
                      <th className={styles.actionsCell}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td style={{ fontWeight: 500 }}>{user.name}</td>
                        <td className={styles.textMuted}>{user.email}</td>
                        <td>
                          <span className={styles.statusBadge} style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary-color)' }}>
                            {user.profile?.name || 'Sem Perfil'}
                          </span>
                        </td>
                        <td className={styles.textMuted}>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
                        <td className={styles.actionsCell}>
                          <button className={styles.btnActionDots}>⋮</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === 'perfis') {
      return (
        <div className={styles.tabContent}>
          <div className={styles.tableCard}>
            <div className={styles.tableToolbar}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Gerenciar Perfis e Acessos</h2>
              <button className={styles.btnAdd} onClick={() => {
                setProfileFormData({ id: '', name: '', permissions: [] });
                setIsProfileModalOpen(true);
              }}>
                <span>+</span> Novo Perfil
              </button>
            </div>

            {loading ? (
              <div className={styles.loading}>Carregando perfis...</div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Nome do Perfil</th>
                      <th>Permissões</th>
                      <th>Usuários</th>
                      <th className={styles.actionsCell}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((profile) => (
                      <tr key={profile.id}>
                        <td style={{ fontWeight: 500 }}>{profile.name}</td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {profile.permissions.length === AVAILABLE_PERMISSIONS.length 
                              ? <span className={styles.statusBadge} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>Acesso Total</span>
                              : profile.permissions.slice(0, 2).map(p => (
                                  <span key={p} className={styles.statusBadge} style={{ background: 'rgba(100, 116, 139, 0.1)', color: 'var(--text-muted)' }}>
                                    {AVAILABLE_PERMISSIONS.find(ap => ap.id === p)?.label || p}
                                  </span>
                                ))
                            }
                            {profile.permissions.length > 2 && profile.permissions.length !== AVAILABLE_PERMISSIONS.length && (
                              <span className={styles.statusBadge} style={{ background: 'rgba(100, 116, 139, 0.1)', color: 'var(--text-muted)' }}>
                                +{profile.permissions.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={styles.textMuted}>{profile._count?.users || 0} usuários</td>
                        <td className={styles.actionsCell}>
                          <button 
                            className={styles.btnActionDots}
                            onClick={() => {
                              setProfileFormData({ id: profile.id, name: profile.name, permissions: profile.permissions });
                              setIsProfileModalOpen(true);
                            }}
                          >
                            ✏️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === 'logs') {
      return (
        <div className={styles.tabContent}>
          <div className={styles.tableCard}>
            <div className={styles.tableToolbar}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Log de Auditoria</h2>
              <button className={styles.btnAdd} style={{ backgroundColor: 'var(--text-muted)' }} onClick={fetchData}>
                Atualizar Logs
              </button>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Ação</th>
                    <th>Entidade</th>
                    <th>IP</th>
                    <th>Data/Hora</th>
                    <th className={styles.actionsCell}>Dtl</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontWeight: 500 }}>
                        {log.user?.name || 'Sistema'}
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{log.user?.email}</div>
                      </td>
                      <td>
                        <span className={styles.statusBadge} style={{ color: getActionColor(log.action), border: `1px solid ${getActionColor(log.action)}`, background: 'none' }}>
                          {log.action}
                        </span>
                      </td>
                      <td>{log.entity || '-'}</td>
                      <td className={styles.textMuted} style={{ fontSize: '0.8rem' }}>{log.ip}</td>
                      <td className={styles.textMuted}>
                        {new Date(log.createdAt).toLocaleString('pt-BR')}
                      </td>
                      <td className={styles.actionsCell}>
                        <button className={styles.btnActionDots} onClick={() => setSelectedLog(log)}>ℹ️</button>
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Nenhum log registrado ainda.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'perfil') {
      return (
        <div className={styles.tabContent}>
          <div className={styles.profileCard}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem' }}>Meu Perfil</h2>
            <div className={styles.formGroup}><label className={styles.label}>Nome Completo</label><input type="text" className={styles.input} value={userProfile.name} readOnly /></div>
            <div className={styles.formGroup}><label className={styles.label}>E-mail Corporativo</label><input type="email" className={styles.input} value={userProfile.email} readOnly /></div>
            <div className={styles.formGroup}><label className={styles.label}>Nova Senha</label><input type="password" className={styles.input} placeholder="Deixe em branco para manter" /></div>
            <button className={styles.btnSave}>Salvar Alterações</button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className="title">Configurações</h1>
        <p className="subtitle">Gerencie usuários, perfis de acesso e audite ações do sistema.</p>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'usuario' ? styles.tabActive : ''}`} onClick={() => setActiveTab('usuario')}>Usuário</button>
        <button className={`${styles.tab} ${activeTab === 'perfis' ? styles.tabActive : ''}`} onClick={() => setActiveTab('perfis')}>Perfis</button>
        <button className={`${styles.tab} ${activeTab === 'logs' ? styles.tabActive : ''}`} onClick={() => setActiveTab('logs')}>Logs</button>
        <button className={`${styles.tab} ${activeTab === 'perfil' ? styles.tabActive : ''}`} onClick={() => setActiveTab('perfil')}>Perfil</button>
      </div>

      {renderTabContent()}

      {/* User Modal */}
      {isUserModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsUserModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}><h2>Cadastrar Novo Usuário</h2><button className={styles.closeBtn} onClick={() => setIsUserModalOpen(false)}>×</button></div>
            <form onSubmit={handleCreateUser}>
              <div className={styles.modalBody}>
                {formError && <div className={styles.error}>{formError}</div>}
                <div className={styles.formGroup}><label className={styles.label}>Nome</label><input type="text" className={styles.input} required value={userFormData.name} onChange={e => setUserFormData({...userFormData, name: e.target.value})} /></div>
                <div className={styles.formGroup}><label className={styles.label}>Email</label><input type="email" className={styles.input} required value={userFormData.email} onChange={e => setUserFormData({...userFormData, email: e.target.value})} /></div>
                <div className={styles.formGroup}><label className={styles.label}>Senha</label><input type="password" className={styles.input} required value={userFormData.password} onChange={e => setUserFormData({...userFormData, password: e.target.value})} /></div>
                <div className={styles.formGroup}><label className={styles.label}>Perfil</label><select className={styles.input} required value={userFormData.profileId} onChange={e => setUserFormData({...userFormData, profileId: e.target.value})}><option value="">Selecione...</option>{profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
              </div>
              <div className={styles.modalFooter}><button type="button" className={styles.btnCancel} onClick={() => setIsUserModalOpen(false)}>Cancelar</button><button type="submit" className={styles.btnSave} disabled={formLoading}>Cadastrar</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsProfileModalOpen(false)}>
          <div className={styles.modalContent} style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}><h2>{profileFormData.id ? 'Editar Perfil' : 'Novo Perfil'}</h2><button className={styles.closeBtn} onClick={() => setIsProfileModalOpen(false)}>×</button></div>
            <form onSubmit={handleSaveProfile}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}><label className={styles.label}>Nome do Perfil</label><input type="text" className={styles.input} required value={profileFormData.name} onChange={e => setProfileFormData({...profileFormData, name: e.target.value})} /></div>
                <div className={styles.formGroup}><label className={styles.label}>Permissões</label><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>{AVAILABLE_PERMISSIONS.map(p => (<label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}><input type="checkbox" checked={profileFormData.permissions.includes(p.id)} onChange={() => togglePermission(p.id)} />{p.label}</label>))}</div></div>
              </div>
              <div className={styles.modalFooter}><button type="button" className={styles.btnCancel} onClick={() => setIsProfileModalOpen(false)}>Cancelar</button><button type="submit" className={styles.btnSave} disabled={formLoading}>Salvar</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Log Details Modal */}
      {selectedLog && (
        <div className={styles.modalOverlay} onClick={() => setSelectedLog(null)}>
          <div className={styles.modalContent} style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Detalhes do Log</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedLog(null)}>×</button>
            </div>

            <div className={styles.modalBody} style={{ padding: 0 }}>
              {/* Action Banner */}
              <div style={{
                background: getActionBg(selectedLog.action),
                borderBottom: `2px solid ${getActionColor(selectedLog.action)}`,
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: getActionColor(selectedLog.action),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem', flexShrink: 0,
                }}>
                  {selectedLog.action === 'LOGIN' && '🔑'}
                  {selectedLog.action.startsWith('CREATE') && '✚'}
                  {selectedLog.action.startsWith('UPDATE') && '✎'}
                  {selectedLog.action.startsWith('DELETE') && '✕'}
                  {!['LOGIN'].includes(selectedLog.action) && !selectedLog.action.startsWith('CREATE') && !selectedLog.action.startsWith('UPDATE') && !selectedLog.action.startsWith('DELETE') && '⚙'}
                </div>
                <div>
                  <span style={{
                    display: 'inline-block',
                    background: getActionColor(selectedLog.action),
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    letterSpacing: '0.06em',
                    padding: '2px 8px',
                    borderRadius: 9999,
                    marginBottom: '0.4rem',
                  }}>{selectedLog.action}</span>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500, lineHeight: 1.5 }}>
                    {getActionDescription(selectedLog)}
                  </p>
                </div>
              </div>

              {/* Info Grid */}
              <div style={{ padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem 1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Usuário</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>{selectedLog.user?.name || 'Sistema'}</div>
                  {selectedLog.user?.email && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedLog.user.email}</div>}
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Endereço IP</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', fontFamily: 'monospace' }}>{selectedLog.ip || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Entidade</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
                    {selectedLog.entity || '—'}
                    {selectedLog.entityId && <span style={{ marginLeft: 6, fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{selectedLog.entityId.slice(0, 8)}…</span>}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Data / Hora</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>{new Date(selectedLog.createdAt).toLocaleString('pt-BR')}</div>
                </div>
              </div>

              {/* Technical Details */}
              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-color)', padding: '1rem 1.5rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    Dados Técnicos
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {Object.entries(selectedLog.details)
                      .filter(([k]) => k !== 'password')
                      .map(([key, value]) => (
                        <div key={key} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.82rem' }}>
                          <span style={{ minWidth: 120, color: 'var(--text-muted)', fontWeight: 500, flexShrink: 0 }}>{key}</span>
                          <span style={{
                            color: 'var(--text-main)',
                            background: 'var(--bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 4,
                            padding: '1px 6px',
                            fontFamily: 'monospace',
                            fontSize: '0.78rem',
                            wordBreak: 'break-all',
                          }}>
                            {Array.isArray(value)
                              ? value.join(', ') || '(vazio)'
                              : typeof value === 'object'
                                ? JSON.stringify(value)
                                : String(value ?? '—')}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnSave} onClick={() => setSelectedLog(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
