import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ProducersService } from './producers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('producers')
@UseGuards(JwtAuthGuard)
export class ProducersController {
  constructor(private readonly producersService: ProducersService) {}

  @Get()
  findAll() {
    return this.producersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.producersService.findOne(id);
  }

  @Get(':id/statement')
  getStatement(@Param('id') id: string) {
    return this.producersService.getStatement(id);
  }
}
