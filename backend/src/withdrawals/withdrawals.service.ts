import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class WithdrawalsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async findAll(status?: string) {
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    return this.prisma.withdrawal.findMany({
      where,
      include: {
        producer: {
          select: {
            name: true,
            email: true,
            document: true,
            pixKey: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: string, observation?: string) {
    const data: any = { status, observation };
    
    if (status === 'APPROVED') {
      data.approvedAt = new Date();
    } else if (status === 'COMPLETED') {
      data.completedAt = new Date();
    }

    return this.prisma.withdrawal.update({
      where: { id },
      data,
    });
  }

  async notifyFinance(data: { withdrawalIds: string[] }) {
    const withdrawals = await this.prisma.withdrawal.findMany({
      where: {
        id: { in: data.withdrawalIds },
        status: 'APPROVED',
      },
      include: {
        producer: { select: { name: true, document: true, pixKey: true } }
      }
    });

    if (withdrawals.length === 0) {
      return { success: false, message: 'Nenhum saque válido para notificação.' };
    }

    try {
      // Envia o e-mail real usando o MailService
      await this.mailService.sendWithdrawalNotification(withdrawals);

      // Registra a auditoria
      await this.prisma.auditLog.create({
        data: {
          action: 'FINANCE_NOTIFICATION_SENT',
          entity: 'Withdrawal',
          details: { 
            count: withdrawals.length, 
            ids: data.withdrawalIds, 
            recipients: ['tania.souza@superfin.com.br', 'pablo.werner@superfin.com.br'] 
          }
        }
      });

      return { 
        success: true, 
        message: 'Notificação enviada com sucesso aos responsáveis!' 
      };
    } catch (error) {
      console.error('[WithdrawalsService] Erro ao enviar e-mail:', error);
      return { 
        success: false, 
        message: 'Erro técnico ao disparar e-mail. Verifique os logs do servidor.' 
      };
    }
  }
}
