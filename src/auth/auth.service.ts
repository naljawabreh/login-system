import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
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

  async register(registerDto: RegisterDto): Promise<{ accessToken: string }> {
    const { username, email, password, firstName, lastName, phoneNumber, birthdate, language, photo } = registerDto;
    // const hashedPassword = await bcrypt.hash(password, 10)
    const user = this.usersService.create(username, email, password, firstName, lastName, phoneNumber, birthdate, language, photo);
    
    const payload = { id: user._id };
    const accessToken = this.jwtService.sign(payload);
  
    return { accessToken };
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const { email, password } = loginDto;
    const user = await this.usersService.findOneByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { id: user._id };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }
}
