import { Module, Global } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
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
    ConfigModule.forRoot({ isGlobal: true }),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      defaults: {
        from: process.env.SMTP_FROM,
      },
    }),
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
