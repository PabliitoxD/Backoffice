import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    try {
      console.log('[AppService] Iniciando bootstrap de usuários administrativos...');
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      const adminEmails = ['admin@superfin.com.br', 'pablo.werner@superfin.com.br'];

      for (const email of adminEmails) {
        await this.prisma.user.upsert({
          where: { email },
          update: { password: hashedPassword, role: 'ADMIN' },
          create: {
            email,
            name: email === 'admin@superfin.com.br' ? 'Administrador' : 'Pablo Werner',
            password: hashedPassword,
            role: 'ADMIN',
          },
        });
        console.log(`[AppService] Usuário garantido: ${email}`);
      }
      console.log('[AppService] Bootstrap finalizado com sucesso.');
    } catch (error) {
      console.error('[AppService] Erro durante o bootstrap (usuários):', error.message);
      // Não re-throw para evitar crash loop do app se o banco estiver temporariamente offline
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
