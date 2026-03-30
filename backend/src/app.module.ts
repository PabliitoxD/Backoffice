import { Module, Global } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { ProducersModule } from './producers/producers.module';
import { TransactionsModule } from './transactions/transactions.module';
import { WithdrawalsModule } from './withdrawals/withdrawals.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { FinancialModule } from './financial/financial.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ProfilesModule,
    AuditLogsModule,
    ProducersModule,
    TransactionsModule,
    WithdrawalsModule,
    FinancialModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
