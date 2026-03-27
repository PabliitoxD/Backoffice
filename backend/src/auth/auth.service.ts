import { Injectable, UnauthorizedException } from '@nestjs/common';
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

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any, ip?: string) {
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
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Fallback to Administrative profile if none specified
    let profileId = data.profileId;
    if (!profileId) {
      const adminProfile = await this.prisma.profile.findFirst({
        where: { name: 'Administrativo' }
      });
      profileId = adminProfile?.id;
    }

    try {
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          role: data.role || 'ADMIN',
          profileId: profileId,
        },
      });

      await this.auditLogsService.logAction({
        userId: user.id,
        action: 'REGISTER',
        details: { email: user.email, name: user.name },
      });

      return user;
    } catch (error) {
      // Resilience fallback if profile table/column missing
      console.error('Registration error, attempting fallback:', error.message);
      return this.prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          role: data.role || 'ADMIN',
        },
      });
    }
  }
}
