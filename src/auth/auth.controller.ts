import { Controller, Post, Body, UseGuards, Get, Request, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserDocument } from 'src/users/schemas/user.schema';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiOperation } from '@nestjs/swagger';

@ApiTags('login')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async register(@Body() registerDto: RegisterDto): Promise<UserDocument> {
    return this.authService.register(registerDto);
  }

  @Post('/login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`Login attempt with identifier: ${loginDto.identifier}`);
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile successfully retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  getProfile(@Request() req) {
    this.logger.log('User profile endpoint hit received...');
    const user = req.user;
    this.logger.log(`Request user: ${JSON.stringify(req.user)}`);
    console.log('Authenticated user:', user);
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP for completing registration' })
  @ApiResponse({ status: 200, description: 'OTP successfully verified' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async verifyOtp(@Request() req, @Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(req.user.id, verifyOtpDto.otp);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'Token successfully refreshed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return { accessToken: await this.authService.refreshToken(refreshToken) };
  }
}
