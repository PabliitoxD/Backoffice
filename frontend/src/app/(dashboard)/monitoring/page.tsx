"use client";

import { useState, useEffect, useCallback } from 'react';
import styles from './monitoring.module.css';

type Status = 'UP' | 'DOWN' | 'DEGRADED';

interface Integration {
  id: string;
  name: string;
  description: string;
  url: string;
  status: Status;
  uptimePercent: number;
  responseTimeMs: number;
  lastChecked: Date;
  history: Status[]; // last 30 checks
}

// Simulated integrations — replace with real API call when backend is ready
const INTEGRATIONS_CONFIG = [
  { id: 'pix-api', name: 'Pix API', description: 'Processamento de pagamentos Pix', url: 'https://api.tronnus.com/pix/health' },
  { id: 'boleto', name: 'Gateway de Boleto', description: 'Emissão e consulta de boletos bancários', url: 'https://api.tronnus.com/boleto/health' },
  { id: 'webhook', name: 'Webhook Delivery', description: 'Entrega de eventos para clientes', url: 'https://api.tronnus.com/webhooks/health' },
  { id: 'antifraude', name: 'Antifraude', description: 'Análise de risco em transações', url: 'https://api.tronnus.com/fraud/health' },
  { id: 'notificacoes', name: 'Notificações', description: 'Envio de SMS e e-mail', url: 'https://api.tronnus.com/notifications/health' },
  { id: 'conciliacao', name: 'Conciliação', description: 'Reconciliação automática de recebíveis', url: 'https://api.tronnus.com/reconciliation/health' },
];

function randomStatus(seed: number): Status {
  if (seed < 0.92) return 'UP';
  if (seed < 0.97) return 'DEGRADED';
  return 'DOWN';
}

function generateMockIntegration(cfg: typeof INTEGRATIONS_CONFIG[0]): Integration {
  const seed = Math.random();
  const status = randomStatus(seed);
  return {
    ...cfg,
    status,
    uptimePercent: status === 'UP' ? 99.5 + Math.random() * 0.5 : status === 'DEGRADED' ? 95 + Math.random() * 3 : 88 + Math.random() * 5,
    responseTimeMs: status === 'UP' ? 40 + Math.random() * 80 : status === 'DEGRADED' ? 300 + Math.random() * 400 : 0,
    lastChecked: new Date(),
    history: Array.from({ length: 30 }, () => randomStatus(Math.random())),
  };
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`${styles.badge} ${styles[`badge${status}`]}`}>
      <span className={styles.dot} />
      {status === 'UP' ? 'Operacional' : status === 'DEGRADED' ? 'Degradado' : 'Fora do ar'}
    </span>
  );
}

function UptimeBar({ history }: { history: Status[] }) {
  return (
    <div className={styles.uptimeBar}>
      {history.map((s, i) => (
        <span key={i} className={`${styles.uptimeBlock} ${styles[`block${s}`]}`} title={s} />
      ))}
    </div>
  );
}

export default function MonitoringPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const loadIntegrations = useCallback(async () => {
    setRefreshing(true);
    // Simulate API latency
    await new Promise(r => setTimeout(r, 600));
    setIntegrations(INTEGRATIONS_CONFIG.map(generateMockIntegration));
    setLastRefresh(new Date());
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadIntegrations();
    const interval = setInterval(loadIntegrations, 30000);
    return () => clearInterval(interval);
  }, [loadIntegrations]);

  const allUp = integrations.every(i => i.status === 'UP');
  const hasDown = integrations.some(i => i.status === 'DOWN');
  const downCount = integrations.filter(i => i.status === 'DOWN').length;
  const degradedCount = integrations.filter(i => i.status === 'DEGRADED').length;

  const overallStatus: Status = hasDown ? 'DOWN' : integrations.some(i => i.status === 'DEGRADED') ? 'DEGRADED' : 'UP';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Monitoramento de Integrações</h1>
          <p className={styles.subtitle}>
            Verificação automática a cada 30 segundos ·{' '}
            Última atualização: {lastRefresh.toLocaleTimeString('pt-BR')}
          </p>
        </div>
        <button className={styles.refreshBtn} onClick={loadIntegrations} disabled={refreshing}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={refreshing ? styles.spinning : ''}>
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
          Atualizar
        </button>
      </div>

      {/* Overall status banner */}
      <div className={`${styles.overallBanner} ${styles[`banner${overallStatus}`]}`}>
        <span className={styles.bannerDot} />
        <div>
          <strong>
            {allUp
              ? 'Todos os sistemas operacionais'
              : hasDown
              ? `${downCount} integração${downCount > 1 ? 'ões' : ''} fora do ar`
              : `${degradedCount} integração${degradedCount > 1 ? 'ões' : ''} com desempenho degradado`}
          </strong>
          {!allUp && (
            <p className={styles.bannerSub}>
              Verifique os detalhes abaixo. A equipe técnica será notificada automaticamente.
            </p>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className={styles.statsRow}>
        <div className="card">
          <p className={styles.statLabel}>Total de integrações</p>
          <p className={styles.statValue}>{integrations.length}</p>
        </div>
        <div className="card">
          <p className={styles.statLabel}>Operacionais</p>
          <p className={`${styles.statValue} ${styles.statGreen}`}>
            {integrations.filter(i => i.status === 'UP').length}
          </p>
        </div>
        <div className="card">
          <p className={styles.statLabel}>Degradados</p>
          <p className={`${styles.statValue} ${styles.statYellow}`}>
            {degradedCount}
          </p>
        </div>
        <div className="card">
          <p className={styles.statLabel}>Fora do ar</p>
          <p className={`${styles.statValue} ${styles.statRed}`}>
            {downCount}
          </p>
        </div>
      </div>

      {/* Integration cards */}
      <div className={styles.grid}>
        {integrations.map(integration => (
          <div key={integration.id} className={`card ${styles.integrationCard} ${integration.status !== 'UP' ? styles[`card${integration.status}`] : ''}`}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.integrationName}>{integration.name}</h3>
                <p className={styles.integrationDesc}>{integration.description}</p>
              </div>
              <StatusBadge status={integration.status} />
            </div>

            <div className={styles.metricsRow}>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Uptime (30d)</span>
                <span className={styles.metricValue}>{integration.uptimePercent.toFixed(2)}%</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Tempo de resposta</span>
                <span className={styles.metricValue}>
                  {integration.status === 'DOWN' ? '—' : `${Math.round(integration.responseTimeMs)} ms`}
                </span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Última verificação</span>
                <span className={styles.metricValue}>
                  {integration.lastChecked.toLocaleTimeString('pt-BR')}
                </span>
              </div>
            </div>

            <div className={styles.historySection}>
              <span className={styles.historyLabel}>Histórico (últimas 30 verificações)</span>
              <UptimeBar history={integration.history} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
