import { PrismaService } from '../prisma.service';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class WithdrawalsService {
  constructor(
    private prisma: PrismaService,
    private readonly mailerService: MailerService,
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
    return this.prisma.withdrawal.update({
      where: { id },
      data: { status, observation },
    });
  }

  async notifyFinance(data: { withdrawalIds: string[]; customBody?: string }) {
    const withdrawals = await this.prisma.withdrawal.findMany({
      where: {
        id: { in: data.withdrawalIds },
        status: 'APPROVED',
      },
      include: {
        producer: { select: { name: true, document: true } }
      }
    });

    if (withdrawals.length === 0) {
      return { success: false, message: 'Nenhum saque válido para notificação.' };
    }

    const recipients = ['tania.souza@superfin.com.br', 'pablo.werner@superfin.com.br'];
    
    const emailBody = data.customBody || `
      <h2>Notificação de Saques Autorizados</h2>
      <p>Os seguintes saques foram aprovados e aguardam repasse via PIX:</p>
      <table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th>Produtor</th>
            <th>Documento</th>
            <th>Valor Líquido</th>
            <th>Chave PIX</th>
          </tr>
        </thead>
        <tbody>
          ${withdrawals.map(w => `
            <tr>
              <td>${w.producer.name}</td>
              <td>${w.producer.document}</td>
              <td>R$ ${(w.amount - w.fee).toFixed(2)}</td>
              <td>${w.pixKey || 'Não informada'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p style="margin-top: 20px;">Por favor, realize os pagamentos e atualize o status no sistema.</p>
    `;

    try {
      await this.mailerService.sendMail({
        to: recipients.join(','),
        subject: `Repasse PIX Autorizado (${withdrawals.length} solicitações) - SuperFin`,
        html: emailBody,
      });

      console.log(`[EMAIL] Notificação enviada para ${recipients.join(', ')}`);
    } catch (error) {
      console.error('[EMAIL ERROR] Falha ao enviar e-mail:', error);
      return { success: false, message: 'Erro ao enviar e-mail para o financeiro.' };
    }

    return { 
      success: true, 
      message: 'Notificação enviada com sucesso!' 
    };
  }
}

