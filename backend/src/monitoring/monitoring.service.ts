import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

const CHECK_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
const RETENTION_DAYS = 90;

export type CheckStatus = 'UP' | 'DOWN' | 'DEGRADED';

export interface CheckResult {
  timestamp: Date;
  status: CheckStatus;
  statusCode: number | null;
  responseTimeMs: number | null;
}

type MonitorType = 'url' | 'statuspage' | 'api-probe';

interface MonitorTarget {
  key: string;
  name: string;
  url: string;
  type: MonitorType;
}

// indicator values from Statuspage.io API → our status
const STATUSPAGE_MAP: Record<string, CheckStatus> = {
  none: 'UP',
  minor: 'DEGRADED',
  major: 'DEGRADED',
  critical: 'DOWN',
  maintenance: 'DEGRADED',
};

const TARGETS: MonitorTarget[] = [
  { key: 'checkout',     name: 'Checkout Bravvius', url: 'https://checkout.bravvius.com/',               type: 'url'        },
  { key: 'app',          name: 'App Bravvius',      url: 'https://app.bravvius.com/',                    type: 'url'        },
  { key: 'pagarme',      name: 'Pagar.me',          url: 'https://status.pagar.me/api/v2/summary.json', type: 'statuspage' },
  { key: 'sicoob-pix',   name: 'Sicoob PIX',        url: 'https://api.sicoob.com.br/pix/api/v2/',       type: 'api-probe'  },
  { key: 'sicoob-boleto',name: 'Sicoob Boleto',     url: 'https://api.sicoob.com.br/cobranca-bancaria/v3/boletos', type: 'api-probe' },
];

function resolveUrlStatus(statusCode: number | null, responseTimeMs: number | null): CheckStatus {
  if (!statusCode || statusCode >= 500) return 'DOWN';
  if (statusCode >= 400) return 'DEGRADED';
  if (responseTimeMs && responseTimeMs > 3000) return 'DEGRADED';
  return 'UP';
}

// 401/403 = serviço respondendo normalmente (sem auth) → UP
function resolveApiProbeStatus(statusCode: number | null, responseTimeMs: number | null): CheckStatus {
  if (!statusCode) return 'DOWN';
  if (statusCode >= 500) return 'DOWN';
  if (statusCode === 401 || statusCode === 403) return 'UP';
  if (statusCode >= 400) return 'DEGRADED';
  if (responseTimeMs && responseTimeMs > 3000) return 'DEGRADED';
  return 'UP';
}

@Injectable()
export class MonitoringService implements OnModuleInit, OnModuleDestroy {
  private interval: NodeJS.Timeout | null = null;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.runAllChecks();
    this.interval = setInterval(() => this.runAllChecks(), CHECK_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.interval) clearInterval(this.interval);
  }

  private async runAllChecks(): Promise<void> {
    await Promise.all(TARGETS.map(t => this.runCheck(t)));
    await this.purgeOldChecks();
  }

  async runCheck(target: MonitorTarget): Promise<void> {
    const result = target.type === 'statuspage'
      ? await this.checkStatuspage(target)
      : target.type === 'api-probe'
        ? await this.checkApiProbe(target)
        : await this.checkUrl(target);

    await this.prisma.monitoringCheck.create({ data: { service: target.key, ...result } });
  }

  private async checkUrl(target: MonitorTarget) {
    const start = Date.now();
    let statusCode: number | null = null;
    let responseTimeMs: number | null = null;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(target.url, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'User-Agent': 'Tronnus-Monitor/1.0' },
      });
      clearTimeout(timeout);
      statusCode = res.status;
      responseTimeMs = Date.now() - start;
    } catch {
      responseTimeMs = Date.now() - start;
    }

    return { status: resolveUrlStatus(statusCode, responseTimeMs), statusCode, responseTimeMs };
  }

  private async checkApiProbe(target: MonitorTarget) {
    const start = Date.now();
    let statusCode: number | null = null;
    let responseTimeMs: number | null = null;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(target.url, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'User-Agent': 'Tronnus-Monitor/1.0' },
      });
      clearTimeout(timeout);
      statusCode = res.status;
      responseTimeMs = Date.now() - start;
    } catch {
      responseTimeMs = Date.now() - start;
    }

    return { status: resolveApiProbeStatus(statusCode, responseTimeMs), statusCode, responseTimeMs };
  }

  private async checkStatuspage(target: MonitorTarget) {
    const start = Date.now();
    let statusCode: number | null = null;
    let responseTimeMs: number | null = null;
    let status: CheckStatus = 'DOWN';

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(target.url, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'User-Agent': 'Tronnus-Monitor/1.0' },
      });
      clearTimeout(timeout);
      statusCode = res.status;
      responseTimeMs = Date.now() - start;

      if (res.ok) {
        const json = await res.json() as { status?: { indicator?: string } };
        const indicator = json?.status?.indicator ?? 'critical';
        status = STATUSPAGE_MAP[indicator] ?? 'DOWN';
      }
    } catch {
      responseTimeMs = Date.now() - start;
    }

    return { status, statusCode, responseTimeMs };
  }

  private async purgeOldChecks(): Promise<void> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
    await this.prisma.monitoringCheck.deleteMany({ where: { checkedAt: { lt: cutoff } } });
  }

  private async buildStatus(target: MonitorTarget) {
    const checks = await this.prisma.monitoringCheck.findMany({
      where: { service: target.key },
      orderBy: { checkedAt: 'asc' },
    });

    const latest = checks[checks.length - 1] ?? null;
    const upCount = checks.filter(r => r.status === 'UP').length;
    const uptimePercent = checks.length > 0 ? (upCount / checks.length) * 100 : null;

    return {
      key: target.key,
      url: target.url,
      name: target.name,
      type: target.type,
      current: latest ? {
        timestamp: latest.checkedAt,
        status: latest.status as CheckStatus,
        statusCode: latest.statusCode,
        responseTimeMs: latest.responseTimeMs,
      } : null,
      uptimePercent,
      history: checks.map(r => ({
        timestamp: r.checkedAt,
        status: r.status as CheckStatus,
        statusCode: r.statusCode,
        responseTimeMs: r.responseTimeMs,
      })),
    };
  }

  getStatus(key: string) {
    const target = TARGETS.find(t => t.key === key);
    if (!target) throw new Error(`Monitor '${key}' not found`);
    return this.buildStatus(target);
  }

  async triggerCheck(key: string) {
    const target = TARGETS.find(t => t.key === key);
    if (!target) throw new Error(`Monitor '${key}' not found`);
    await this.runCheck(target);
    return this.buildStatus(target);
  }

  listTargets() {
    return TARGETS.map(t => ({ key: t.key, name: t.name, type: t.type }));
  }

  // Notes
  async getNotes(service: string) {
    return this.prisma.monitoringNote.findMany({
      where: { service },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addNote(service: string, content: string, author: string, periodStart?: string, periodEnd?: string) {
    return this.prisma.monitoringNote.create({
      data: {
        service,
        content,
        author,
        periodStart: periodStart ? new Date(periodStart) : null,
        periodEnd: periodEnd ? new Date(periodEnd) : null,
      },
    });
  }

  async deleteNote(id: string) {
    return this.prisma.monitoringNote.delete({ where: { id } });
  }
}
