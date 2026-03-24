import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: any) {
    const { email, password, name } = data;
    
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('E-mail já cadastrado');

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    const { password: _, ...result } = user;
    return result;
  }

  async login(data: any) {
    const { email, password } = data;
    console.log(`[AuthService] Tentativa de login: ${email}`);

    try {
      if (!this.prisma.user) {
        console.error('[AuthService] Erro: Tabela User não encontrada no PrismaService.');
        throw new Error('Database Client Error');
      }

      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        console.warn(`[AuthService] Login falhou: Usuário não encontrado - ${email}`);
        throw new UnauthorizedException('Credenciais inválidas');
      }

      console.log(`[AuthService] Usuário ${email} encontrado. Verificando senha...`);
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
         console.warn(`[AuthService] Login falhou: Senha incorreta - ${email}`);
         throw new UnauthorizedException('Credenciais inválidas');
      }

      console.log(`[AuthService] Senha OK. Gerando token para ${email}...`);
      const payload = { email: user.email, sub: user.id };
      const token = this.jwtService.sign(payload);
      
      console.log(`[AuthService] Token gerado com sucesso.`);
      return {
        access_token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      console.error(`[AuthService] ERRO CRÍTICO NO LOGIN:`, error);
      throw error;
    }
  }
}
