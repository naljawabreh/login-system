import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  Logger,
  Headers,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto, RegenerateOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-pass.dto';
import { ResetPasswordDto } from './dto/reset-pass.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
  ApiHeader,
} from '@nestjs/swagger';
import { registrationResponseDto, FullUserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDTO } from './dto/change-password.dto';

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
    this.logger.log(
      `Registration attempt for ${registerDto.email} with language: ${language}`,
    );
    const standardizedLanguage = language ? language.toLowerCase() : 'en';
    return this.authService.register(registerDto, standardizedLanguage);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile successfully retrieved',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  getProfile(@Request() req) {
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
  @ApiBearerAuth('JWT-auth')
  async verifyOtp(@Request() req, @Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(req.user.email, verifyOtpDto.otp);
  }

  @Post('regenerate-otp')
  @ApiOperation({ summary: 'Regenerate and resend OTP for user' })
  @ApiResponse({
    status: 200,
    description: 'OTP successfully regenerated and sent',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async regenerateOtp(@Body() regenerateOtpDto: RegenerateOtpDto) {
    return this.authService.regenerateOtp(regenerateOtpDto.email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  @ApiOperation({ summary: 'Logout a user' })
  @ApiResponse({ status: 200, description: 'User successfully logged out' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
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

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @ApiOperation({ summary: 'Change User Password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  async changePassword(@Body() changePasswordDTO: ChangePasswordDTO, @Request() req) {
    return this.authService.changePassword(req.user.id, changePasswordDTO);
  }


  @Post('/forgot-password')
  @ApiOperation({ summary: 'Initiate forgot password process' })
  @ApiResponse({ status: 200, description: 'OTP sent to the user’s email' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.findByEmailSendOTP(forgotPasswordDto.email);
    return { message: 'OTP sent to your email' };
  }

  @Post('/reset-password')
  @ApiOperation({ summary: 'Reset password using OTP' })
  @ApiResponse({ status: 200, description: 'Password successfully reset' })
  @ApiResponse({ status: 400, description: 'Invalid OTP or OTP expired' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const user = await this.authService.findUserValidateOTP(
      resetPasswordDto.email,
      resetPasswordDto.otp,
    );

    // Update the user's password
    user.password = resetPasswordDto.newPassword;
    user.otp = undefined;
    await user.save();

    return { message: 'Password successfully reset' };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/edit-profile')
  @ApiOperation({ summary: 'Edit user profile' })
  @ApiBearerAuth('JWT-auth')
  async updateUser(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const userMail = req.user.email;
    return this.authService.updateUser(userMail, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/delete-user')
  @ApiOperation({ summary: 'Soft delete user' })
  @ApiBearerAuth('JWT-auth')
  async deleteUser(@Request() req) {
    const userMail = req.user.email;
    return this.authService.softDeleteUser(userMail);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/restore-user')
  @ApiOperation({ summary: 'Restore deleted user' })
  @ApiBearerAuth('JWT-auth')
  async restoreUser(@Request() req) {
    const userMail = req.user.email;
    return this.authService.restoreUser(userMail);
  }
}
