import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [
    AuditLogsModule,
    MulterModule.register({ dest: './uploads/chargeback-defense' }),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, PrismaService]
})
export class TransactionsModule {}

