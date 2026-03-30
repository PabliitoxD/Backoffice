import { Module } from '@nestjs/common';
import { ProducersController } from './producers.controller';
import { ProducersService } from './producers.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ProducersController],
  providers: [ProducersService, PrismaService]
})
export class ProducersModule {}
