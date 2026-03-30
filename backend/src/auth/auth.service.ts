import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private auditLogsService: AuditLogsService,
  ) {}

  async login(data: any, ip?: string) {
    const { email, password } = data;
    
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
    
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Credenciais inválidas');

    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role,
      permissions: user.profile?.permissions || [],
    };

    await this.auditLogsService.logAction({
      userId: user.id,
      action: 'LOGIN',
      ip,
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    };
  }

  async register(data: any) {
    const { email, password, name, role, profileId } = data;
    
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('E-mail já cadastrado');

    const hashedPassword = await bcrypt.hash(password, 10);
    
    let finalProfileId = profileId;
    if (!finalProfileId) {
      const adminProfile = await this.prisma.profile.findFirst({
        where: { name: 'Administrativo' }
      });
      finalProfileId = adminProfile?.id;
    }

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: role || 'ADMIN',
          profileId: finalProfileId || null,
        },
      });

      await this.auditLogsService.logAction({
        userId: user.id,
        action: 'REGISTER',
        details: { email: user.email, name: user.name },
      });

      return user;
    } catch (error) {
      console.error('Registration error, attempting fallback:', (error as Error).message);
      return this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: role || 'ADMIN',
        },
      });
    }
  }
}
