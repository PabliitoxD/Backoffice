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
    
    try {
      console.log(`[AuthService] Tentativa de login para: ${email}`);
      const user = await this.prisma.user.findUnique({ where: { email } });
      
      if (!user) {
        console.log(`[AuthService] Usuário não encontrado: ${email}`);
        throw new UnauthorizedException('Credenciais inválidas');
      }

      console.log(`[AuthService] Usuário encontrado, comparando senha...`);
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
         console.log(`[AuthService] Senha incorreta para: ${email}`);
         throw new UnauthorizedException('Credenciais inválidas');
      }

      console.log(`[AuthService] Login bem-sucedido, gerando token...`);
      const payload = { email: user.email, sub: user.id };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      console.error(`[AuthService] Erro fatal no login:`, error);
      throw error; // Re-throw to keep the 500 or the specific NestJS exception
    }
  }
}
