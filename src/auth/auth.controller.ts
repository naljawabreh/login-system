import { Controller, Post, Body, UseGuards, Get, Request, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserDocument } from 'src/users/schemas/user.schema';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() registerDto: RegisterDto): Promise<UserDocument> {
    return this.authService.register(registerDto);
  }

  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    this.logger.log('User profile endpoint hit received...');
    const user = req.user;
    this.logger.log(`Request user: ${JSON.stringify(req.user)}`);
    console.log('Authenticated user:', user);
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-otp')
  async verifyOtp(@Request() req, @Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(req.user.id, verifyOtpDto.otp);
  }

  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return { accessToken: await this.authService.refreshToken(refreshToken) };
  }
}
