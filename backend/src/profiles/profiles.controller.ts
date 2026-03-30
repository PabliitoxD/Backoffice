import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
<<<<<<< HEAD
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Profiles')
@ApiBearerAuth()
=======
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

>>>>>>> Feature/0004/login-singup
@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  findAll() {
    return this.profilesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profilesService.findOne(id);
  }

  @Post()
<<<<<<< HEAD
  create(@Body() data: { name: string; permissions: any }) {
=======
  create(@Body() data: { name: string; permissions: string[] }) {
>>>>>>> Feature/0004/login-singup
    return this.profilesService.create(data);
  }

  @Put(':id')
<<<<<<< HEAD
  update(@Param('id') id: string, @Body() data: any) {
=======
  update(@Param('id') id: string, @Body() data: { name?: string; permissions?: string[] }) {
>>>>>>> Feature/0004/login-singup
    return this.profilesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.profilesService.remove(id);
  }
}
