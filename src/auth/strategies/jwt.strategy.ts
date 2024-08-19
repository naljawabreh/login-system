import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
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
    this.logger.error(`User not found for payload: ${JSON.stringify(payload.id)}`);
    throw new UnauthorizedException();
  }
  this.logger.log(`User validated: ${JSON.stringify(user)}`);
  return user;
  }
}
