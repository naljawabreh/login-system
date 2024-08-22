import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, isString } from 'class-validator';
// Data Transfer Object
export class LoginDto {
    @ApiProperty({ example: 'john.doe@example.com', description: 'The email of the user' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$|^(0097[02]5)\d{8}$/, { message: 'Identifier must be a valid email or mobile number' })
    readonly identifier: string;

    @ApiProperty({ example: 'strong 8 char password', description: 'The password of the user' })
    @IsString()
    @IsNotEmpty()
    readonly password: string;
  }