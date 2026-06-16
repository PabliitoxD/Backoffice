import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

const CHECK_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
const HISTORY_SIZE = 30;

export type CheckStatus = 'UP' | 'DOWN' | 'DEGRADED';

export interface CheckResult {
  timestamp: Date;
  status: CheckStatus;
  statusCode: number | null;
  responseTimeMs: number | null;
}

interface MonitorTarget {
  name: string;
  url: string;
  history: CheckResult[];
}

function resolveStatus(statusCode: number | null, responseTimeMs: number | null): CheckStatus {
  if (!statusCode || statusCode >= 500) return 'DOWN';
  if (statusCode >= 400) return 'DEGRADED';
  if (responseTimeMs && responseTimeMs > 3000) return 'DEGRADED';
  return 'UP';
}

const TARGETS: Omit<MonitorTarget, 'history'>[] = [
  { name: 'Checkout Bravvius', url: 'https://checkout.bravvius.com/' },
  { name: 'App Bravvius', url: 'https://app.bravvius.com/' },
];

@Injectable()
export class MonitoringService implements OnModuleInit, OnModuleDestroy {
  private monitors: MonitorTarget[] = TARGETS.map(t => ({ ...t, history: [] }));
  private interval: NodeJS.Timeout | null = null;

  onModuleInit() {
    this.runAllChecks();
    this.interval = setInterval(() => this.runAllChecks(), CHECK_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.interval) clearInterval(this.interval);
  }

  private async runAllChecks(): Promise<void> {
    await Promise.all(this.monitors.map(m => this.runCheck(m)));
  }

  async runCheck(monitor: MonitorTarget): Promise<void> {
    const start = Date.now();
    let statusCode: number | null = null;
    let responseTimeMs: number | null = null;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(monitor.url, {
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

    const result: CheckResult = {
      timestamp: new Date(),
      status: resolveStatus(statusCode, responseTimeMs),
      statusCode,
      responseTimeMs,
    };

    monitor.history.push(result);
    if (monitor.history.length > HISTORY_SIZE) {
      monitor.history.shift();
    }
  }

  private buildStatus(monitor: MonitorTarget) {
    const latest = monitor.history[monitor.history.length - 1] ?? null;
    const upCount = monitor.history.filter(r => r.status === 'UP').length;
    const uptimePercent = monitor.history.length > 0
      ? (upCount / monitor.history.length) * 100
      : null;

    return {
      url: monitor.url,
      name: monitor.name,
      current: latest,
      uptimePercent,
      history: monitor.history.map(r => ({
        timestamp: r.timestamp,
        status: r.status,
        responseTimeMs: r.responseTimeMs,
        statusCode: r.statusCode,
      })),
    };
  }

  getCheckoutStatus() {
    return this.buildStatus(this.monitors[0]);
  }

  getAppStatus() {
    return this.buildStatus(this.monitors[1]);
  }

  async triggerCheckout(): Promise<ReturnType<typeof this.getCheckoutStatus>> {
    await this.runCheck(this.monitors[0]);
    return this.getCheckoutStatus();
  }

  async triggerApp(): Promise<ReturnType<typeof this.getAppStatus>> {
    await this.runCheck(this.monitors[1]);
    return this.getAppStatus();
  }
}
