import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<any> {
    const { username, email, password, firstName, lastName, phoneNumber, birthdate, language, photo } = registerDto;
    const user = await this.usersService.create(username, email, password, firstName, lastName, phoneNumber, birthdate, language, photo);
    await this.usersService.generateOtp(user);

    const accessToken = this.jwtService.sign(
      { id: user._id, registrationState: user.registrationState },
      { expiresIn: '1d' },
    );

    const refreshToken = this.jwtService.sign(
      { id: user._id },
      { expiresIn: '7d' },
    );

    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
  }

  async login(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;  
    const user = await this.usersService.findOneByEmail(email);
    if (!user || !(await user.comparePassword(password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.registrationState === 'pending') {
      await this.usersService.generateOtp(user);
      return { message: 'OTP resent. Please verify your registration.' };
    }

    const accessToken = this.jwtService.sign(
      { id: user._id, registrationState: user.registrationState },
      { expiresIn: '1d' },
    );

    const refreshToken = this.jwtService.sign(
      { id: user._id },
      { expiresIn: '7d' },
    );

    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
  }

  async verifyOtp(userId: string, otp: string): Promise<UserDocument> {
    return this.usersService.verifyOtp(userId, otp);
  }

  async refreshToken(oldRefreshToken: string): Promise<string> {
    try {
      const payload = this.jwtService.verify(oldRefreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.usersService.findOneById(payload.id);
      if (!user || user.refreshToken !== oldRefreshToken) {
        throw new UnauthorizedException();
      }

      const newAccessToken = this.jwtService.sign(
        { id: user._id, registrationState: user.registrationState },
        { expiresIn: '1d' },
      );

      return newAccessToken;
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
