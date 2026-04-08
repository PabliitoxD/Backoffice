import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class WithdrawalsService {
  constructor(private prisma: PrismaService) {}

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

  async notifyFinance(data: { withdrawalIds: string[] }) {
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

    console.log(`\n\n=== [MOCK] E-MAIL DE NOTIFICAÇÃO AO FINANCEIRO ===`);
    console.log(`Assunto: Repasse PIX Autorizado (${withdrawals.length} solicitações)`);
    console.log(`Destinatário: financeiro@plataforma.com`);
    console.log(`\nSaques aprovados e aguardando repasse:`);
    withdrawals.forEach(w => {
      const payout = w.amount - w.fee;
      console.log(`- ${w.producer.name} (Doc: ${w.producer.document})`);
      console.log(`  Chave PIX: ${w.pixKey || 'Não informada'}`);
      console.log(`  Valor a transferir: R$ ${payout.toFixed(2)}`);
      console.log(`  ID Saque: ${w.id}\n`);
    });
    console.log(`====================================================\n\n`);

    return { 
      success: true, 
      message: 'Notificação enviada com sucesso!' 
    };
  }
}

