import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { BaseUserDto, LoginResponseDto, PendingUserDto, registrationResponseDto } from './dto/user.dto';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<registrationResponseDto> {
    const { username, email, password, firstName, lastName, phoneNumber, birthdate, language, photoURL } = registerDto;
    const user = await this.usersService.create(username, email, password, firstName, lastName, phoneNumber, birthdate, language, photoURL);
    await this.usersService.generateOtp(user);

    const accessToken = this.jwtService.sign(
      { id: user._id, username: user.username, registrationState: user.registrationState },
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

  async validateUser(loginDto: LoginDto): Promise<UserDocument | null> {
    this.logger.log(`Validating user with identifier: ${loginDto.identifier}`);
    const user = await this.usersService.findOneByEmailOrPhoneNumber(loginDto.identifier);
    if (user) {
      const isMatch = await user.comparePassword(loginDto.password);
      if (isMatch) {
        this.logger.log(`Password matched for user: ${user.email}`);
        return user;
      } else {
        this.logger.warn(`Password mismatch for user: ${user.email}`);
      }
    } else {
      this.logger.warn(`User not found with identifier: ${loginDto.identifier}`);
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    this.logger.log(`Attempting login for identifier: ${loginDto.identifier}`);
    const user = await this.validateUser(loginDto);
    if (!user) {
      this.logger.warn(`Invalid credentials for identifier: ${loginDto.identifier}`);
      throw new UnauthorizedException('Invalid credentials');
    }
  
    const accessToken = this.jwtService.sign(
      { id: user._id, username: user.username, registrationState: user.registrationState },
      { expiresIn: this.configService.get<string | number>('JWT_EXPIRES') },
    );
  
    const refreshToken = this.jwtService.sign(
      { id: user._id, registrationState: user.registrationState },
      { expiresIn: this.configService.get<string | number>('JWT_REFRESH_EXPIRES') },
    );
  
    user.refreshToken = refreshToken;
    await user.save();
  
    this.logger.log(`User logged in: ${user.email}`);
  
    if (user.registrationState === 'pending') {
      await this.usersService.generateOtp(user);
      const pendingUser: PendingUserDto = {
        email: user.email,
        username: user.username,
        registrationState: user.registrationState,
        otp: user.otp,
      };
      return {
        accessToken,
        refreshToken,
        user: pendingUser,
      };
    }
  
    const baseUser: BaseUserDto = {
      email: user.email,
      username: user.username,
      registrationState: user.registrationState,
    };
  
    return {
      accessToken,
      refreshToken,
      user: baseUser,
    };
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
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newAccessToken = this.jwtService.sign(
        { id: user._id, username: user.username, registrationState: user.registrationState },
        { expiresIn: '1d' },
      );

      return newAccessToken;
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
