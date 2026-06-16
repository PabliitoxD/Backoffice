import { Controller, Post, Body, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any, @Req() req: any) {
    return this.authService.login(body, req.ip || req.socket?.remoteAddress);
  }

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }
}
