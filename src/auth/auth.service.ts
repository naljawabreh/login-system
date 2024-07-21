import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    return this.usersService.create(username, email, password, firstName, lastName, phoneNumber, birthdate, language, photo);
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const { email, password } = loginDto;  
    const user = await this.usersService.findOneByEmail(email);
    if (!user || !(await user.comparePassword(password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { id: user._id };
    const accessToken = this.jwtService.sign(payload);
  
    return { accessToken };
  }
}
