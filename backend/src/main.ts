import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
<<<<<<< HEAD
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
=======
>>>>>>> Feature/0004/login-singup
import { AuditInterceptor } from './audit-logs/audit.interceptor';
import { AuditLogsService } from './audit-logs/audit-logs.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
<<<<<<< HEAD
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  
  const auditLogsService = app.get(AuditLogsService);
  app.useGlobalInterceptors(new AuditInterceptor(auditLogsService));
  
  const config = new DocumentBuilder()
    .setTitle('Backoffice API')
    .setDescription('The Backoffice API documentation for producers, customers and transactions')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3001);
=======
  
  // Set global interceptor for audit logs
  const auditLogsService = app.get(AuditLogsService);
  app.useGlobalInterceptors(new AuditInterceptor(auditLogsService));
  
  app.enableCors();
  await app.listen(process.env.PORT || 3001);
>>>>>>> Feature/0004/login-singup
}
bootstrap();
