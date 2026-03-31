import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { status?: string; producerId?: string; search?: string; startDate?: string; endDate?: string } = {}) {
    const { status, producerId, search, startDate, endDate } = query;
    return this.prisma.transaction.findMany({
      where: {
        status,
        producerId,
        ...(search ? {
          OR: [
            { id: { contains: search, mode: 'insensitive' } },
            { customer: { name: { contains: search, mode: 'insensitive' } } },
            { producer: { name: { contains: search, mode: 'insensitive' } } },
          ]
        } : {}),
        ...(startDate || endDate ? {
          chargebackAt: {
            gte: startDate ? new Date(startDate) : undefined,
            lte: endDate ? new Date(endDate) : undefined,
          }
        } : {}),
      },
      include: {
        producer: { select: { name: true } },
        customer: { select: { name: true } },
        product: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markChargeback(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) throw new NotFoundException('Transaction not found');

    return this.prisma.transaction.update({
      where: { id },
      data: {
        status: 'CHARGEBACK',
        chargebackAt: new Date(),
        history: {
          create: {
            status: 'CHARGEBACK',
            details: 'Marcado via Backoffice',
          },
        },
      },
    });
  }

  async updateChargebackObservation(id: string, observation: string) {
    return this.prisma.transaction.update({
      where: { id },
      data: { chargebackObservation: observation },
    });
  }
}

