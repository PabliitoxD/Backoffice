import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    if (!process.env.DATABASE_URL) {
      console.error('[PrismaService] FALTANDO VARIÁVEL DE AMBIENTE: DATABASE_URL');
      console.error('[PrismaService] Por favor, configure a DATABASE_URL nas variáveis de ambiente do seu servidor/Easypanel.');
      return; // Evita crash catastrófico, mas o app não terá banco
    }
    try {
      await this.$connect();
      console.log('[PrismaService] Conexão com o banco de dados estabelecida com sucesso.');
    } catch (e) {
      console.error('[PrismaService] Falha na conexão com o banco de dados:', e.message);
    }
  }
}
