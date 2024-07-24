import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyOtpDto {
    @ApiProperty({ example: '123456', description: 'The OTP sent to the user' })
    @IsString()
    @IsNotEmpty()
    otp: string;
  }