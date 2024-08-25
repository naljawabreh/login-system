import { validate } from 'class-validator';
import { ResetPasswordDto } from 'src/auth/dto/reset-pass.dto';

describe('ResetPassDto', () => {
  it('should validate the passwords', async () => {
    const dto = {
        newPassword: 'newStrongPassword123',
        email: 'test@example.com',
        otp: '12345',
    } as any;
    
    const errors = await validate(dto);
    
    expect(errors.length).toBe(0);
});

it('should return validation error if passwords do not match', async () => {
    const dto = {
        newPassword: 'newStrongPassword123',
        email: 'test@example.com',
        otp: '12345',
    } as any;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('confirmPassword');
  });
});
