import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async logAction(data: {
    userId?: string;
    action: string;
    entity?: string;
    entityId?: string;
    details?: any;
    ip?: string;
  }) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          details: data.details,
          ip: data.ip,
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  async findAll(query: { userId?: string; action?: string; limit?: number } = {}) {
    return this.prisma.auditLog.findMany({
      where: {
        userId: query.userId,
        action: query.action,
      },
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit || 100,
    });
  }
}
