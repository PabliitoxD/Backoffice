import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import * as bcrypt from 'bcrypt';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private auditLogsService: AuditLogsService,
  ) {}

<<<<<<< HEAD
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
=======
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
>>>>>>> Feature/0004/login-singup

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

<<<<<<< HEAD
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
=======
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
>>>>>>> Feature/0004/login-singup
  }
}
