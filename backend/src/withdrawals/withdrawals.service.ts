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

  async findAll(query: { producerId?: string; status?: string } = {}) {
    return this.prisma.withdrawal.findMany({
      where: {
        producerId: query.producerId,
        status: query.status,
      },
      include: {
        producer: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.withdrawal.update({
      where: { id },
      data: { status },
    });
  }
}
