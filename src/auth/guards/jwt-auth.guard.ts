import { Injectable, ExecutionContext, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    private readonly logger = new Logger(JwtAuthGuard.name);

    canActivate(context: ExecutionContext) {
      this.logger.log('Checking JWT authentication');
      return super.canActivate(context);
    }
  
    handleRequest(err, user, info) {
      if (err) {
        this.logger.error(`Error in JWT authentication: ${err.message}`);
        throw err;
      }
      if (!user) {
        this.logger.warn(`JWT authentication failed: ${info?.message}`);
        throw new UnauthorizedException();
      }
      this.logger.log(`JWT authenticated user: ${JSON.stringify(user)}`);
      return user;
    }
}
