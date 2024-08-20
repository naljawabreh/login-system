import { ApiProperty } from '@nestjs/swagger';
import {IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsBoolean, Matches} from 'class-validator';

export class RegisterDto {
    @ApiProperty({ example: 'john.doe@example.com', description: 'The email of the user' })
    @IsNotEmpty()
    @IsEmail({}, {message: 'Please enter correct email'})
    readonly email: string;
    
    @ApiProperty({ example: 'strong 8 char password', description: 'The password of the user' })
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    readonly password: string;

    @ApiProperty({ example: 'John', description: 'The first name of the user' })
    @IsNotEmpty()
    @IsString()
    readonly firstName: string;

    @ApiProperty({ example: 'Doe', description: 'The last name of the user' })
    @IsNotEmpty()
    @IsString()
    readonly lastName: string;
    
    @ApiProperty({ example: '1234567890', description: 'The phone number of the user' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^(0097[02]5)\d{8}$/, {
      message: 'Phone number must start with 009705 or 009725 and consist of 14 digits long.',
    })
    phoneNumber: string;
    
    @ApiProperty({ example: 'en', description: 'The preferred language of the user' })
    @IsString()
    @IsOptional()
    readonly language?: string;

    @ApiProperty({ example: true, description: 'Indicates if the user is a resident' })
    @IsBoolean()
    readonly isResident: boolean;
  }