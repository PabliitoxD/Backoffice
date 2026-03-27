import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { ProducersModule } from './producers/producers.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';

@Module({
  imports: [ProducersModule, TransactionsModule, AuthModule, UsersModule, ProfilesModule, AuditLogsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
