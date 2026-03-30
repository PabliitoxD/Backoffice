import { Module, Global } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { ProducersModule } from './producers/producers.module';
import { TransactionsModule } from './transactions/transactions.module';
import { WithdrawalsModule } from './withdrawals/withdrawals.module';
import { AuthModule } from './auth/auth.module';
<<<<<<< HEAD
=======
import { UsersModule } from './users/users.module';
>>>>>>> Feature/0004/login-singup
import { ProfilesModule } from './profiles/profiles.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';

@Module({
<<<<<<< HEAD
  imports: [
    AuthModule,
    ProfilesModule,
    AuditLogsModule,
    ProducersModule,
    TransactionsModule,
    WithdrawalsModule,
  ],
=======
  imports: [ProducersModule, TransactionsModule, AuthModule, UsersModule, ProfilesModule, AuditLogsModule],
>>>>>>> Feature/0004/login-singup
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
