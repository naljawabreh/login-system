import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<UserDocument> {
    const { username, email, password, firstName, lastName, phoneNumber, birthdate, language, photo } = registerDto;
    const user = await this.usersService.create(username, email, password, firstName, lastName, phoneNumber, birthdate, language, photo);
    await this.usersService.generateOtp(user);
    return user;
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string } | { message: string }> {
    const { email, password } = loginDto;  
    const user = await this.usersService.findOneByEmail(email);
    if (!user || !(await user.comparePassword(password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.registrationState === 'pending') {
      await this.usersService.generateOtp(user);
      return { message: 'OTP resent. Please verify your registration.' };
    }

    const payload = { id: user._id };
    const accessToken = this.jwtService.sign(payload);
  
    return { accessToken };
  }

  async verifyOtp(email: string, otp: string): Promise<UserDocument> {
    return this.usersService.verifyOtp(email, otp);
  }
}
