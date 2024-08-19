import { Controller, Post, Body, UseGuards, Get, Request, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { registrationResponseDto } from './dto/user.dto';

@ApiTags('login')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async register(@Body() registerDto: RegisterDto): Promise<registrationResponseDto> {
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


  @Post('/logout')
  @ApiOperation({ summary: 'Logout a user' })
  @ApiResponse({ status: 200, description: 'User successfully logged out' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async logout(@Request() req) {
    this.logger.log('Logout endpoint hit received...');
    const user = req.user;
  
    await this.authService.logout(user);
  
    this.logger.log(`User logged out: ${user.id}`);
    return { message: 'Successfully logged out' };
  }

  @Post('/forgot-password')
  @ApiOperation({ summary: 'Initiate forgot password process' })
  @ApiResponse({ status: 200, description: "OTP sent to the user’s email" })
  @ApiResponse({ status: 404, description: 'User not found' })
  async forgotPassword(@Body('email') email: string) {
    await this.authService.findByEmailSendOTP(email);
    return { message: 'OTP sent to your email' };
  }
  
  @Post('/reset-password')
  @ApiOperation({ summary: 'Reset password using OTP' })
  @ApiResponse({ status: 200, description: 'Password successfully reset' })
  @ApiResponse({ status: 400, description: 'Invalid OTP or OTP expired' })
  async resetPassword(
    @Body('email') email: string,
    @Body('otp') otp: string,
    @Body('newPassword') newPassword: string
  ) {
    const user = await this.authService.findEmailValidateOTP(email, otp);

    // Update the user's password
    user.password = newPassword;
    user.otp = undefined;
    await user.save();

    return { message: 'Password successfully reset' };
  }

}
