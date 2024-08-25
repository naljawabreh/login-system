import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    jwtAuthGuard = new JwtAuthGuard(reflector);
  });

  it('should return true if user is authenticated', () => {
    const context = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue({ user: { id: '1' } }),
    } as unknown as ExecutionContext;

    const result = jwtAuthGuard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should return false if user is not authenticated', () => {
    const context = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue({ user: null }),
    } as unknown as ExecutionContext;

    const result = jwtAuthGuard.canActivate(context);

    expect(result).toBe(false);
  });
});
