import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    const transaction = await this.prisma.transaction.findUnique({ where: { id } });
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

  async launchExtraCharge(id: string, amount: number, reason: string) {
    const originalTx = await this.prisma.transaction.findUnique({ where: { id } });
    if (!originalTx) throw new NotFoundException('Transaction not found');

    return this.prisma.transaction.create({
      data: {
        amount,
        status: 'APPROVED',
        method: originalTx.method || 'PIX',
        condition: '1x',
        customerId: originalTx.customerId,
        producerId: originalTx.producerId,
        productId: originalTx.productId,
        chargebackObservation: `[Cobrança Extra - Taxa Chargeback] ${reason}`
      }
    });
  }

  async submitChargebackDefense(
    id: string,
    description: string,
    files: { originalname: string; filename: string; mimetype: string; size: number }[],
  ) {
    const transaction = await this.prisma.transaction.findUnique({ where: { id } });
    if (!transaction) throw new NotFoundException('Transaction not found');
    if (transaction.status !== 'CHARGEBACK') {
      throw new BadRequestException('Esta transação não está em estado de chargeback.');
    }

    if (transaction.chargebackAt) {
      const elapsed = Date.now() - new Date(transaction.chargebackAt).getTime();
      const fiveDays = 5 * 24 * 60 * 60 * 1000;
      if (elapsed > fiveDays) {
        throw new BadRequestException('O prazo de 5 dias corridos para envio de defesa foi encerrado.');
      }
    }

    const filesMeta = files.map((f) => ({
      name: f.originalname,
      filename: f.filename,
      type: f.mimetype,
      size: f.size,
    }));

    // Simulate acquirer reference — in production, call the acquirer API here
    const acquirerRef = `ACQ-DEF-${Date.now()}`;

    const defense = await (this.prisma as any).chargebackDefense.create({
      data: {
        transactionId: id,
        description,
        files: filesMeta,
        status: 'SENT',
        acquirerRef,
      },
    });

    await this.prisma.transactionHistory.create({
      data: {
        transactionId: id,
        status: 'DEFENSE_SUBMITTED',
        details: `Defesa enviada à adquirente. Ref: ${acquirerRef}. Arquivos: ${files.map((f: any) => f.originalname).join(', ')}`,
      },
    });

    return { success: true, acquirerRef, defense };
  }
}
