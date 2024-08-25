import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ example: '12345', description: 'The OTP sent to the user' })
  @IsString()
  @IsNotEmpty()
  readonly otp: string;

  @ApiProperty({
    example: 'newStrongPassword8Char',
    description: 'The new password for the user',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  readonly newPassword: string;
}
