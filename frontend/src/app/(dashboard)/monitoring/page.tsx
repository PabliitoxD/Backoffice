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

interface CheckoutMonitor {
  url: string;
  name: string;
  current: CheckResult | null;
  uptimePercent: number | null;
  history: CheckResult[];
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
  const [data, setData] = useState<CheckoutMonitor | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (trigger = false) => {
    setRefreshing(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const endpoint = trigger ? '/monitoring/checkout/check' : '/monitoring/checkout';
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: trigger ? 'POST' : 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: CheckoutMonitor = await res.json();
      setData(json);
      setLastRefresh(new Date());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar monitoramento');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(), 30000);
    return () => clearInterval(interval);
  }, [load]);

  const status = data?.current?.status ?? null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Monitoramento de Checkout</h1>
          <p className={styles.subtitle}>
            Verificação automática a cada 2 minutos ·{' '}
            Exibição atualizada: {lastRefresh.toLocaleTimeString('pt-BR')}
          </p>
        </div>
        <button className={styles.refreshBtn} onClick={() => load(true)} disabled={refreshing}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={refreshing ? styles.spinning : ''}>
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

      {status && (
        <div className={`${styles.overallBanner} ${styles[`banner${status}`]}`}>
          <span className={styles.bannerDot} />
          <div>
            <strong>
              {status === 'UP'
                ? 'Checkout operacional'
                : status === 'DEGRADED'
                ? 'Checkout com desempenho degradado'
                : 'Checkout fora do ar'}
            </strong>
            {status !== 'UP' && (
              <p className={styles.bannerSub}>
                A equipe técnica foi notificada. Verifique os detalhes abaixo.
              </p>
            )}
          </div>
        </div>
      )}

      {data && (
        <>
          <div className={styles.statsRow}>
            <div className="card">
              <p className={styles.statLabel}>Uptime (últimas verificações)</p>
              <p className={`${styles.statValue} ${data.uptimePercent && data.uptimePercent >= 99 ? styles.statGreen : data.uptimePercent && data.uptimePercent >= 95 ? styles.statYellow : styles.statRed}`}>
                {data.uptimePercent !== null ? `${data.uptimePercent.toFixed(1)}%` : '—'}
              </p>
            </div>
            <div className="card">
              <p className={styles.statLabel}>Tempo de resposta</p>
              <p className={styles.statValue}>
                {data.current?.responseTimeMs != null ? `${data.current.responseTimeMs} ms` : '—'}
              </p>
            </div>
            <div className="card">
              <p className={styles.statLabel}>Código HTTP</p>
              <p className={styles.statValue}>
                {data.current?.statusCode ?? '—'}
              </p>
            </div>
            <div className="card">
              <p className={styles.statLabel}>Última verificação</p>
              <p className={styles.statValue} style={{ fontSize: '1.1rem' }}>
                {data.current ? new Date(data.current.timestamp).toLocaleTimeString('pt-BR') : '—'}
              </p>
            </div>
          </div>

          <div className="card">
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.integrationName}>{data.name}</h3>
                <p className={styles.integrationDesc}>{data.url}</p>
              </div>
              {data.current && <StatusBadge status={data.current.status} />}
            </div>

            <div className={styles.historySection} style={{ marginTop: '1.25rem' }}>
              <div className={styles.historyLabelRow}>
                <span className={styles.historyLabel}>
                  Histórico — últimas {data.history.length} verificações
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
                {[...data.history].reverse().slice(0, 10).map((r, i) => (
                  <div key={i} className={styles.historyTableRow}>
                    <span>{new Date(r.timestamp).toLocaleTimeString('pt-BR')}</span>
                    <StatusBadge status={r.status} />
                    <span className={styles.codeCell}>{r.statusCode ?? '—'}</span>
                    <span>{r.responseTimeMs != null ? `${r.responseTimeMs} ms` : '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {!data && !error && (
        <div className={styles.loadingState}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.spinning}>
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
          Realizando primeira verificação...
        </div>
      )}

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
