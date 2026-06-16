import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogsService } from './audit-logs.service';

// Map URL segments to friendly entity names
const ENTITY_MAP: Record<string, string> = {
  users: 'Users',
  profiles: 'Profiles',
  transactions: 'Transactions',
  withdrawals: 'Withdrawals',
  producers: 'Producers',
  clients: 'Clients',
  plans: 'Plans',
  financial: 'Financial',
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditLogsService: AuditLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip } = request;

    const modificationMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (!modificationMethods.includes(method)) return next.handle();
    // Skip routes that already have manual audit logging
    if (url.includes('/audit-logs') || url.includes('/auth/login') || url.includes('/chargeback/defense')) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        // Parse URL: /segment1/id/segment2/...
        const cleanUrl = url.split('?')[0];
        const parts = cleanUrl.replace(/^\//, '').split('/');
        const entityKey = parts[0] || 'unknown';
        const entity = ENTITY_MAP[entityKey] || (entityKey.charAt(0).toUpperCase() + entityKey.slice(1));
        const entityId = parts[1] && parts[1].length > 8 ? parts[1] : undefined;

        // Build sub-action from trailing URL segments (e.g. /chargeback/observation → chargeback_observation)
        const subAction = parts.slice(2).join('_').toUpperCase().replace(/-/g, '_') || undefined;

        let action: string;
        if (method === 'POST') action = `CREATE_${entity.toUpperCase()}`;
        else if (method === 'PUT' || method === 'PATCH') action = `UPDATE_${entity.toUpperCase()}`;
        else if (method === 'DELETE') action = `DELETE_${entity.toUpperCase()}`;
        else action = `${method}_${entity.toUpperCase()}`;

        // Append sub-action for clarity (e.g. UPDATE_TRANSACTIONS_CHARGEBACK_OBSERVATION)
        if (subAction) action = `${action}_${subAction}`;

        // Get userId from JWT payload — NestJS JWT stores sub as id
        const userId: string | undefined = user?.sub || user?.id;

        // Only log safe body fields (never passwords, tokens)
        const body = request.body;
        let safeDetails: Record<string, unknown> | undefined;
        if (body && typeof body === 'object' && method !== 'DELETE') {
          const { password, token, ...rest } = body as any;
          safeDetails = Object.keys(rest).length > 0 ? rest : undefined;
        }
        if (method === 'DELETE') {
          safeDetails = { url: cleanUrl };
        }

        this.auditLogsService.logAction({
          userId,
          action,
          entity,
          entityId,
          details: safeDetails,
          ip,
        });
      }),
    );
  }
}
