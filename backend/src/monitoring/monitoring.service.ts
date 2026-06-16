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

interface MonitorTarget {
  key: string;
  name: string;
  url: string;
}

const TARGETS: MonitorTarget[] = [
  { key: 'checkout', name: 'Checkout Bravvius', url: 'https://checkout.bravvius.com/' },
  { key: 'app',      name: 'App Bravvius',      url: 'https://app.bravvius.com/' },
];

function resolveStatus(statusCode: number | null, responseTimeMs: number | null): CheckStatus {
  if (!statusCode || statusCode >= 500) return 'DOWN';
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

    await this.prisma.monitoringCheck.create({
      data: {
        service: target.key,
        status: resolveStatus(statusCode, responseTimeMs),
        statusCode,
        responseTimeMs,
      },
    });
  }

  private async purgeOldChecks(): Promise<void> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
    await this.prisma.monitoringCheck.deleteMany({
      where: { checkedAt: { lt: cutoff } },
    });
  }

  private async buildStatus(key: string, name: string, url: string) {
    const checks = await this.prisma.monitoringCheck.findMany({
      where: { service: key },
      orderBy: { checkedAt: 'asc' },
    });

    const latest = checks[checks.length - 1] ?? null;
    const upCount = checks.filter(r => r.status === 'UP').length;
    const uptimePercent = checks.length > 0 ? (upCount / checks.length) * 100 : null;

    return {
      url,
      name,
      current: latest
        ? {
            timestamp: latest.checkedAt,
            status: latest.status as CheckStatus,
            statusCode: latest.statusCode,
            responseTimeMs: latest.responseTimeMs,
          }
        : null,
      uptimePercent,
      history: checks.map(r => ({
        timestamp: r.checkedAt,
        status: r.status as CheckStatus,
        statusCode: r.statusCode,
        responseTimeMs: r.responseTimeMs,
      })),
    };
  }

  getCheckoutStatus() {
    return this.buildStatus('checkout', TARGETS[0].name, TARGETS[0].url);
  }

  getAppStatus() {
    return this.buildStatus('app', TARGETS[1].name, TARGETS[1].url);
  }

  async triggerCheckout() {
    await this.runCheck(TARGETS[0]);
    return this.getCheckoutStatus();
  }

  async triggerApp() {
    await this.runCheck(TARGETS[1]);
    return this.getAppStatus();
  }

  // Notes
  async getNotes(service: string) {
    return this.prisma.monitoringNote.findMany({
      where: { service },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addNote(service: string, content: string, author: string) {
    return this.prisma.monitoringNote.create({
      data: { service, content, author },
    });
  }

  async deleteNote(id: string) {
    return this.prisma.monitoringNote.delete({ where: { id } });
  }
}
