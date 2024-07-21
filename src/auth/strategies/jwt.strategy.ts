import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
  this.logger.log(`Validating JWT payload: ${JSON.stringify(payload)}`);
  const user = await this.usersService.findOneById(payload.id);
  if (!user) {
    this.logger.error(`User not found for payload: ${JSON.stringify(payload)}`);
    throw new UnauthorizedException();
  }
  this.logger.log(`User validated: ${JSON.stringify(user)}`);
  return user;
  }
}
