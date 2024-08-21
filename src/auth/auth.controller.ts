import { Controller, Post, Body, UseGuards, Get, Request, Logger, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto, RegenerateOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-pass.dto';
import { ResetPasswordDto } from './dto/reset-pass.dto';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { registrationResponseDto, FullUserDto} from './dto/user.dto';

@ApiTags('login')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}


  @Post('/login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`Login attempt with identifier: ${loginDto.identifier}`);
    return this.authService.login(loginDto);
  }

  @Post('/register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiHeader({
    name: 'language',
    description: 'Language of the user (e.g., en, ar)',
    required: false,
  })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async register(
    @Body() registerDto: RegisterDto,
    @Headers('language') language: string,
  ): Promise<registrationResponseDto> {
    this.logger.log(`Registration attempt for ${registerDto.email} with language: ${language}`);
    const standardizedLanguage = language ? language.toLowerCase() : 'en';
    return this.authService.register(registerDto, standardizedLanguage);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile successfully retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth("Bearer")
  @ApiHeader({
    name: 'Authorization',
    description: 'the JWT token',
    required: true,
  })
  getProfile(
    @Request() req,
    @Headers('Authorization') Authorization: string,
  ) {
    this.logger.log(`Authorization Header: ${Authorization}`);
    this.logger.log('User profile endpoint hit received...');
    const user = req.user;
    this.logger.log(`Request user: ${JSON.stringify(req.user)}`);
    console.log('Authenticated user:', user);

    const fullUser: FullUserDto = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      isResident: user.isResident,
      photoURL: user.photoURL,
      registrationState: user.registrationState,
    };

    return fullUser;
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP for completing registration' })
  @ApiResponse({ status: 200, description: 'OTP successfully verified' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth("Bearer")
  async verifyOtp(
    @Request() req,
    @Body() verifyOtpDto: VerifyOtpDto,
    @Headers('Authorization') Authorization: string,
  ) {
    this.logger.log(`Authorization Header: ${Authorization}`);
    return this.authService.verifyOtp(req.user.email, verifyOtpDto.otp);
  }
  

  @Post('regenerate-otp')
  @ApiOperation({ summary: 'Regenerate and resend OTP for user' })
  @ApiResponse({ status: 200, description: 'OTP successfully regenerated and sent' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async regenerateOtp(@Body() regenerateOtpDto: RegenerateOtpDto) {
    return this.authService.regenerateOtp(regenerateOtpDto.email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  @ApiOperation({ summary: 'Logout a user' })
  @ApiResponse({ status: 200, description: 'User successfully logged out' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth("Bearer")
  @ApiHeader({
    name: 'Authorization',
    description: 'The JWT token',
    required: true,
  })
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
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.findByEmailSendOTP(forgotPasswordDto.email);
    return { message: 'OTP sent to your email' };
  }
  
  // @Post('/reset-password')
  // @ApiOperation({ summary: 'Reset password using OTP' })
  // @ApiResponse({ status: 200, description: 'Password successfully reset' })
  // @ApiResponse({ status: 400, description: 'Invalid OTP or OTP expired' })
  // async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
  //   const user = await this.authService.findEmailValidateOTP(resetPasswordDto.email, resetPasswordDto.otp);

  //   // Update the user's password
  //   user.password = resetPasswordDto.newPassword;
  //   user.otp = undefined;
  //   await user.save();

  //   return { message: 'Password successfully reset' };
  // }

}
