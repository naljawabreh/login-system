import { validate } from 'class-validator';
import { RegisterDto } from 'src/auth/dto/register.dto';

describe('RegisterDto', () => {
  it('should validate email and password', async () => {
    const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'strongPassword123',
        firstName: 'Amal',
        lastName: 'Salameh',
        phoneNumber: '00970598632932',
        isResident: false,
      };
      const errors = await validate(registerDto);
      
      expect(errors.length).toBe(0); // No validation errors
    });
    
    it('should throw validation error for invalid email', async () => {
      const registerDto: RegisterDto = {
          email: 'test@example.com',
          password: 'strongPassword123',
          firstName: 'Amal',
          lastName: 'Salameh',
          phoneNumber: '00970598632932',
          isResident: false,
        };

    const errors = await validate(registerDto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });
});
