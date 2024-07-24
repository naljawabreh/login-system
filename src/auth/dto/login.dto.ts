import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
  
export class LoginDto {
    @ApiProperty({ example: '0123456789', description: 'The email or mobile number of the user' })
    @IsEmail()
    @IsNotEmpty()
    readonly identifier: string;

    @ApiProperty({ example: 'strong 8 char password', description: 'The password of the user' })
    @IsString()
    @IsNotEmpty()
    readonly password: string;
  }