import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async findAll() {
    try {
      // Try to include profiles (if tables exist)
      return await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          profileId: true,
          profile: {
            select: {
              name: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      // Fallback if profile table or column is missing
      console.warn('Profile table not found, falling back to basic user list');
      return this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }
  }

  async create(data: any) {
    const { profileId, ...rest } = data;
    // We pass profileId to authService.register or handle it here
    // Since register only takes email, password, name, we might need to update it
    return this.authService.register({ ...rest, profileId });
  }
}
