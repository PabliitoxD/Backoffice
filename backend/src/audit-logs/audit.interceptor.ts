import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogsService } from './audit-logs.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditLogsService: AuditLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, ip } = request;

<<<<<<< HEAD
    const modificationMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (!modificationMethods.includes(method)) return next.handle();
    if (url.includes('/audit-logs') || url.includes('/login')) return next.handle();

    return next.handle().pipe(
      tap(() => {
=======
    // We only log modification methods
    const modificationMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (!modificationMethods.includes(method)) {
      return next.handle();
    }

    // Skip logging for the log retrieval itself and sensitive endpoints if needed
    if (url.includes('/audit-logs') || url.includes('/login')) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        // Extract entity from URL (e.g., /users -> User)
>>>>>>> Feature/0004/login-singup
        const parts = url.split('/');
        const entity = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : 'Unknown';
        
        let action = `${method}_${entity.toUpperCase()}`;
        if (method === 'POST') action = `CREATE_${entity.toUpperCase()}`;
        if (method === 'PUT' || method === 'PATCH') action = `UPDATE_${entity.toUpperCase()}`;
        if (method === 'DELETE') action = `DELETE_${entity.toUpperCase()}`;

        this.auditLogsService.logAction({
          userId: user?.id,
          action,
          entity,
<<<<<<< HEAD
          entityId: body?.id || parts[2],
=======
          entityId: body?.id || parts[2], // Try to find ID in body or URL
>>>>>>> Feature/0004/login-singup
          details: method !== 'DELETE' ? body : { url },
          ip,
        });
      }),
    );
  }
}
