import { MailService } from '../mail/mail.service';

@Injectable()
export class WithdrawalsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService
  ) {}

  async create(data: { amount: number; producerId: string }) {
    return this.prisma.withdrawal.create({
      data: {
        amount: data.amount,
        producerId: data.producerId,
        fee: 5.00, // Fixed fee for now until Plans are integrated
        status: 'PENDING',
      },
    });
  }

  async findAll(query: { producerId?: string; status?: string; startDate?: string; endDate?: string; search?: string } = {}) {
    const where: any = {};
    
    if (query.producerId && query.producerId !== 'ALL') where.producerId = query.producerId;
    if (query.status && query.status !== 'ALL') where.status = query.status;

    // date filters
    if (query.startDate && query.endDate) {
      where.createdAt = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate),
      };
    } else if (query.startDate) {
      where.createdAt = { gte: new Date(query.startDate) };
    } else if (query.endDate) {
      where.createdAt = { lte: new Date(query.endDate) };
    }

    // search filter
    if (query.search) {
      where.OR = [
        { id: { contains: query.search, mode: 'insensitive' } },
        { producer: { name: { contains: query.search, mode: 'insensitive' } } }
      ];
    }

    return this.prisma.withdrawal.findMany({
      where,
      include: {
        producer: {
          select: { name: true, email: true, document: true, pixKey: true }
        }
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
          details: { count: withdrawals.length, ids: data.withdrawalIds, recipients: ['tania.souza@superfin.com.br', 'pablo.werner@superfin.com.br'] }
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
