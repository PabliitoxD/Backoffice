"use client";

import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '@/lib/api';
import styles from './monitoring.module.css';

type CheckStatus = 'UP' | 'DOWN' | 'DEGRADED';

interface CheckResult {
  timestamp: string;
  status: CheckStatus;
  statusCode: number | null;
  responseTimeMs: number | null;
}

interface ServiceMonitor {
  url: string;
  name: string;
  current: CheckResult | null;
  uptimePercent: number | null;
  history: CheckResult[];
}

interface MonitoringNote {
  id: string;
  service: string;
  content: string;
  author: string;
  createdAt: string;
}

function StatusBadge({ status }: { status: CheckStatus }) {
  const label = status === 'UP' ? 'Operacional' : status === 'DEGRADED' ? 'Degradado' : 'Fora do ar';
  return (
    <span className={`${styles.badge} ${styles[`badge${status}`]}`}>
      <span className={styles.dot} />
      {label}
    </span>
  );
}

function UptimeBar({ history }: { history: CheckResult[] }) {
  return (
    <div className={styles.uptimeBar}>
      {history.map((r, i) => (
        <span
          key={i}
          className={`${styles.uptimeBlock} ${styles[`block${r.status}`]}`}
          title={`${r.status} · ${new Date(r.timestamp).toLocaleString('pt-BR')}${r.responseTimeMs ? ` · ${r.responseTimeMs}ms` : ''}`}
        />
      ))}
    </div>
  );
}

function NotesSection({ serviceKey }: { serviceKey: string }) {
  const [notes, setNotes] = useState<MonitoringNote[]>([]);
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadNotes = useCallback(async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/monitoring/${serviceKey}/notes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setNotes(await res.json());
  }, [serviceKey]);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  const submit = async () => {
    if (!content.trim() || !author.trim()) return;
    setSubmitting(true);
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/monitoring/${serviceKey}/notes`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content.trim(), author: author.trim() }),
    });
    setContent('');
    await loadNotes();
    setSubmitting(false);
  };

  const remove = async (id: string) => {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/monitoring/notes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className={styles.notesSection}>
      <h4 className={styles.notesTitle}>Notas da equipe</h4>

      <div className={styles.notesList}>
        {notes.length === 0 && (
          <p className={styles.notesEmpty}>Nenhuma nota registrada.</p>
        )}
        {notes.map(note => (
          <div key={note.id} className={styles.noteItem}>
            <div className={styles.noteHeader}>
              <span className={styles.noteAuthor}>{note.author}</span>
              <span className={styles.noteDate}>
                {new Date(note.createdAt).toLocaleString('pt-BR')}
              </span>
              <button
                className={styles.noteDelete}
                onClick={() => remove(note.id)}
                title="Remover nota"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <p className={styles.noteContent}>{note.content}</p>
          </div>
        ))}
      </div>

      <div className={styles.noteForm}>
        <input
          className={styles.noteInput}
          placeholder="Seu nome"
          value={author}
          onChange={e => setAuthor(e.target.value)}
        />
        <textarea
          className={styles.noteTextarea}
          placeholder="Descreva o ocorrido, ação tomada ou observação..."
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={2}
        />
        <button
          className={styles.noteSubmit}
          onClick={submit}
          disabled={submitting || !content.trim() || !author.trim()}
        >
          {submitting ? 'Salvando...' : 'Adicionar nota'}
        </button>
      </div>
    </div>
  );
}

function MonitorCard({
  data,
  serviceKey,
  onTrigger,
  refreshing,
}: {
  data: ServiceMonitor;
  serviceKey: string;
  onTrigger: () => void;
  refreshing: boolean;
}) {
  return (
    <div className="card">
      <div className={styles.cardHeader}>
        <div>
          <h3 className={styles.integrationName}>{data.name}</h3>
          <p className={styles.integrationDesc}>{data.url}</p>
        </div>
        <div className={styles.cardHeaderRight}>
          {data.current && <StatusBadge status={data.current.status} />}
          <button className={styles.refreshBtnSm} onClick={onTrigger} disabled={refreshing} title="Verificar agora">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={refreshing ? styles.spinning : ''}>
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.miniStats}>
        <div>
          <span className={styles.miniLabel}>Uptime</span>
          <span className={`${styles.miniValue} ${data.uptimePercent != null && data.uptimePercent >= 99 ? styles.statGreen : data.uptimePercent != null && data.uptimePercent >= 95 ? styles.statYellow : styles.statRed}`}>
            {data.uptimePercent !== null ? `${data.uptimePercent.toFixed(1)}%` : '—'}
          </span>
        </div>
        <div>
          <span className={styles.miniLabel}>Resposta</span>
          <span className={styles.miniValue}>
            {data.current?.responseTimeMs != null ? `${data.current.responseTimeMs} ms` : '—'}
          </span>
        </div>
        <div>
          <span className={styles.miniLabel}>HTTP</span>
          <span className={styles.miniValue}>{data.current?.statusCode ?? '—'}</span>
        </div>
        <div>
          <span className={styles.miniLabel}>Última checagem</span>
          <span className={styles.miniValue} style={{ fontSize: '0.9rem' }}>
            {data.current ? new Date(data.current.timestamp).toLocaleTimeString('pt-BR') : '—'}
          </span>
        </div>
      </div>

      <div className={styles.historySection} style={{ marginTop: '1.25rem' }}>
        <div className={styles.historyLabelRow}>
          <span className={styles.historyLabel}>
            Últimas 3 verificações · {data.history.length} no total
          </span>
          <span className={styles.historyLegend}>
            <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.blockUP}`} /> Operacional</span>
            <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.blockDEGRADED}`} /> Degradado</span>
            <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.blockDOWN}`} /> Fora do ar</span>
          </span>
        </div>
        {data.history.length > 0
          ? <UptimeBar history={data.history} />
          : <p className={styles.historyEmpty}>Aguardando primeiras verificações...</p>
        }
      </div>

      {data.history.length > 0 && (
        <div className={styles.historyTable}>
          <div className={styles.historyTableHeader}>
            <span>Horário</span>
            <span>Status</span>
            <span>HTTP</span>
            <span>Resposta</span>
          </div>
          {[...data.history].reverse().slice(0, 3).map((r, i) => (
            <div key={i} className={styles.historyTableRow}>
              <span>{new Date(r.timestamp).toLocaleTimeString('pt-BR')}</span>
              <StatusBadge status={r.status} />
              <span className={styles.codeCell}>{r.statusCode ?? '—'}</span>
              <span>{r.responseTimeMs != null ? `${r.responseTimeMs} ms` : '—'}</span>
            </div>
          ))}
        </div>
      )}

      <NotesSection serviceKey={serviceKey} />
    </div>
  );
}

const PENDING_INTEGRATIONS = [
  { name: 'Pix API', description: 'Processamento de pagamentos via Pix' },
  { name: 'Gateway de Boleto', description: 'Emissão e consulta de boletos bancários' },
  { name: 'Webhook Delivery', description: 'Entrega de eventos para clientes' },
  { name: 'Antifraude', description: 'Análise de risco em transações' },
  { name: 'Notificações', description: 'Envio de SMS e e-mail' },
  { name: 'Conciliação', description: 'Reconciliação automática de recebíveis' },
];

function PendingCard({ name, description }: { name: string; description: string }) {
  return (
    <div className={`card ${styles.integrationCard} ${styles.pendingCard}`}>
      <div className={styles.cardHeader}>
        <div>
          <h3 className={styles.integrationName}>{name}</h3>
          <p className={styles.integrationDesc}>{description}</p>
        </div>
        <span className={styles.badgePending}>
          <span className={styles.dot} />
          Aguardando integração
        </span>
      </div>
      <div className={styles.pendingBar}>
        {Array.from({ length: 30 }).map((_, i) => (
          <span key={i} className={`${styles.uptimeBlock} ${styles.blockPENDING}`} />
        ))}
      </div>
    </div>
  );
}

export default function MonitoringPage() {
  const [checkout, setCheckout] = useState<ServiceMonitor | null>(null);
  const [app, setApp] = useState<ServiceMonitor | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [refreshingCheckout, setRefreshingCheckout] = useState(false);
  const [refreshingApp, setRefreshingApp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMonitor = useCallback(async (
    key: 'checkout' | 'app',
    trigger: boolean,
    setData: (d: ServiceMonitor) => void,
    setRefreshing: (v: boolean) => void,
  ) => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = trigger ? `/monitoring/${key}/check` : `/monitoring/${key}`;
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: trigger ? 'POST' : 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
      setLastRefresh(new Date());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar monitoramento');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const loadAll = useCallback((trigger = false) => {
    setError(null);
    fetchMonitor('checkout', trigger, setCheckout, setRefreshingCheckout);
    fetchMonitor('app', trigger, setApp, setRefreshingApp);
  }, [fetchMonitor]);

  useEffect(() => {
    loadAll();
    const interval = setInterval(() => loadAll(), 30000);
    return () => clearInterval(interval);
  }, [loadAll]);

  const overallStatus = (() => {
    const statuses = [checkout?.current?.status, app?.current?.status].filter(Boolean) as CheckStatus[];
    if (statuses.includes('DOWN')) return 'DOWN';
    if (statuses.includes('DEGRADED')) return 'DEGRADED';
    if (statuses.length > 0) return 'UP';
    return null;
  })();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Monitoramento de Serviços</h1>
          <p className={styles.subtitle}>
            Verificação automática a cada 2 minutos ·{' '}
            Atualizado: {lastRefresh.toLocaleTimeString('pt-BR')}
          </p>
        </div>
        <button className={styles.refreshBtn} onClick={() => loadAll(true)} disabled={refreshingCheckout || refreshingApp}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={(refreshingCheckout || refreshingApp) ? styles.spinning : ''}>
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
          Verificar agora
        </button>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      {overallStatus && (
        <div className={`${styles.overallBanner} ${styles[`banner${overallStatus}`]}`}>
          <span className={styles.bannerDot} />
          <div>
            <strong>
              {overallStatus === 'UP'
                ? 'Todos os serviços operacionais'
                : overallStatus === 'DEGRADED'
                ? 'Um ou mais serviços com desempenho degradado'
                : 'Um ou mais serviços fora do ar'}
            </strong>
            {overallStatus !== 'UP' && (
              <p className={styles.bannerSub}>
                A equipe técnica foi notificada. Verifique os detalhes abaixo.
              </p>
            )}
          </div>
        </div>
      )}

      <div className={styles.monitorsGrid}>
        {checkout ? (
          <MonitorCard
            data={checkout}
            serviceKey="checkout"
            onTrigger={() => fetchMonitor('checkout', true, setCheckout, setRefreshingCheckout)}
            refreshing={refreshingCheckout}
          />
        ) : !error && (
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.spinning}>
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
            Verificando checkout...
          </div>
        )}

        {app ? (
          <MonitorCard
            data={app}
            serviceKey="app"
            onTrigger={() => fetchMonitor('app', true, setApp, setRefreshingApp)}
            refreshing={refreshingApp}
          />
        ) : !error && (
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.spinning}>
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
            Verificando app...
          </div>
        )}
      </div>

      {/* Pending integrations */}
      <div className={styles.sectionDivider}>
        <span>Integrações pendentes</span>
      </div>
      <div className={styles.pendingGrid}>
        {PENDING_INTEGRATIONS.map(i => (
          <PendingCard key={i.name} name={i.name} description={i.description} />
        ))}
      </div>
    </div>
  );
}
