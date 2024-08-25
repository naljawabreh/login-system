import { validate } from 'class-validator';
import { VerifyOtpDto } from 'src/auth/dto/verify-otp.dto';

describe('VerifyOtpDto', () => {
  it('should validate the OTP code', async () => {
    const dto = new VerifyOtpDto();
    dto.otp = '123456';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should return validation error if OTP is not valid', async () => {
    const dto = new VerifyOtpDto();
    dto.otp = 'invalid';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('otp');
  });
});
