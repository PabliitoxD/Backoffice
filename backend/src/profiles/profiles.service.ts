import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProfilesService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedAdminProfile();
  }

  private async seedAdminProfile() {
    try {
      const admin = await this.prisma.profile.findUnique({
        where: { name: 'Administrativo' },
      });

      if (!admin) {
        // Create it
        const newAdmin = await this.prisma.profile.create({
          data: {
            name: 'Administrativo',
            permissions: [
              'dashboard:view',
              'clients:manage',
              'transactions:manage',
              'users:manage',
              'profiles:manage',
              'settings:manage',
            ],
          },
        });
        console.log('Seeded Administrativo profile');
        
        // Also assign this profile to all existing users who don't have one
        await this.prisma.user.updateMany({
          where: { profileId: null },
          data: { profileId: newAdmin.id },
        });
      } else {
        // If it already exists, just make sure all users have it if they have none
        await this.prisma.user.updateMany({
          where: { profileId: null },
          data: { profileId: admin.id },
        });
      }
    } catch (error) {
      console.error('Database tables not ready yet. Skipping seed.');
    }
  }

  async findAll() {
    return this.prisma.profile.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.profile.findUnique({
      where: { id },
      include: { users: true },
    });
  }

  async create(data: { name: string; permissions: string[] }) {
    return this.prisma.profile.create({
      data,
    });
  }

  async update(id: string, data: { name?: string; permissions?: string[] }) {
    return this.prisma.profile.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.profile.delete({
      where: { id },
    });
  }
}
