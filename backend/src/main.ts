import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AuditInterceptor } from './audit-logs/audit.interceptor';
import { AuditLogsService } from './audit-logs/audit-logs.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
}
bootstrap();
