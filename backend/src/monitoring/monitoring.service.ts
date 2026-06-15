import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

const CHECKOUT_URL = 'https://checkout.bravvius.com/';
const CHECK_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
const HISTORY_SIZE = 30;

export type CheckStatus = 'UP' | 'DOWN' | 'DEGRADED';

export interface CheckResult {
  timestamp: Date;
  status: CheckStatus;
  statusCode: number | null;
  responseTimeMs: number | null;
}

function resolveStatus(statusCode: number | null, responseTimeMs: number | null): CheckStatus {
  if (!statusCode || statusCode >= 500) return 'DOWN';
  if (statusCode >= 400) return 'DEGRADED';
  if (responseTimeMs && responseTimeMs > 3000) return 'DEGRADED';
  return 'UP';
}

@Injectable()
export class MonitoringService implements OnModuleInit, OnModuleDestroy {
  private history: CheckResult[] = [];
  private interval: NodeJS.Timeout | null = null;

  onModuleInit() {
    this.runCheck();
    this.interval = setInterval(() => this.runCheck(), CHECK_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.interval) clearInterval(this.interval);
  }

  async runCheck(): Promise<void> {
    const start = Date.now();
    let statusCode: number | null = null;
    let responseTimeMs: number | null = null;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(CHECKOUT_URL, {
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

    this.history.push(result);
    if (this.history.length > HISTORY_SIZE) {
      this.history.shift();
    }
  }

  getStatus() {
    const latest = this.history[this.history.length - 1] ?? null;
    const upCount = this.history.filter(r => r.status === 'UP').length;
    const uptimePercent = this.history.length > 0
      ? (upCount / this.history.length) * 100
      : null;

    return {
      url: CHECKOUT_URL,
      name: 'Checkout Bravvius',
      current: latest,
      uptimePercent,
      history: this.history.map(r => ({
        timestamp: r.timestamp,
        status: r.status,
        responseTimeMs: r.responseTimeMs,
        statusCode: r.statusCode,
      })),
    };
  }
}
