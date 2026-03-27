import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private auditLogsService: AuditLogsService,
  ) {}

  async register(data: any) {
    const { email, password, name, profileId } = data;
    
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('E-mail já cadastrado');

    const hashedPassword = await bcrypt.hash(password, 10);
    
    let user;
    try {
      // Try to create with profileId (if column exists)
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'ADMIN',
          profileId: profileId || null,
        },
      });
    } catch (error) {
      // Fallback if profileId column is missing
      console.warn('Profile schema not ready, creating user without profileId');
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(data: any) {
    const { email, password } = data;
    
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Credenciais inválidas');

    // Log successful login
    await this.auditLogsService.logAction({
      userId: user.id,
      action: 'LOGIN',
      entity: 'Auth',
      details: { email: user.email },
    });

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
  }
}
