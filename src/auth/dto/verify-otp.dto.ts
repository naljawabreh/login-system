import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ example: '12345', description: 'The OTP sent to the user' })
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class RegenerateOtpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
}
