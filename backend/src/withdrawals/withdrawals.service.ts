import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class WithdrawalsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(data: any) {
    return this.prisma.withdrawal.create({
      data: {
        amount: data.amount,
        status: 'PENDING',
        producerId: data.producerId,
        pixKey: data.pixKey,
        fee: data.fee || 0,
      },
    });
  }

  async findAll(filters: any) {
    const { status, producerId, startDate, endDate, search } = filters;
    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (producerId) {
      where.producerId = producerId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { producer: { name: { contains: search, mode: 'insensitive' } } },
      ];
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
