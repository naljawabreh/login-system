import { ApiProperty } from '@nestjs/swagger';
import {IsEmail, IsNotEmpty, IsString, MinLength, IsDate, IsOptional, IsBoolean} from 'class-validator';

export class RegisterDto {
    @ApiProperty({ example: 'judoChan', description: 'The username of the user' })
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    readonly username?: string;

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
    readonly phoneNumber: string;
    
    @ApiProperty({ example: '1990-01-01', description: 'The birthdate of the user' })
    @IsDate()
    @IsNotEmpty()
    @IsOptional()
    readonly birthdate?: Date;
    
    @ApiProperty({ example: 'en', description: 'The preferred language of the user' })
    @IsString()
    @IsOptional()
    readonly language?: string;
    
    @ApiProperty({ example: 'http://example.com/photo.jpg', description: 'The photoURL URL of the user' })
    @IsString()
    @IsOptional()
    readonly photoURL?: string;
    
    @ApiProperty({ example: true, description: 'Indicates if the user is a resident' })
    @IsBoolean()
    readonly isResident: boolean;
  }
  