import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuditInterceptor } from './audit-logs/audit.interceptor';
import { AuditLogsService } from './audit-logs/audit-logs.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Set global interceptor for audit logs
  const auditLogsService = app.get(AuditLogsService);
  app.useGlobalInterceptors(new AuditInterceptor(auditLogsService));
  
  app.enableCors();
  await app.listen(process.env.PORT || 3001);
}
bootstrap();
