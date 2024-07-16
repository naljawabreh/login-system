import {IsEmail, IsNotEmpty, IsString, MinLength} from 'class-validator';

export class RegisterDto {
    @IsNotEmpty()
    readonly username: string;

    @IsNotEmpty()
    @IsEmail({}, {message: 'Please enter correct email'})
    readonly email: string;
    
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    readonly password: string;

    @IsNotEmpty()
    @IsString()
    readonly firstName: string;

    @IsNotEmpty()
    @IsString()
    readonly lastName: string;
    
    @IsNotEmpty()
    readonly phoneNumber: string;
    
    @IsNotEmpty()
    readonly birthdate: Date;
    
    readonly language?: string;
    
    readonly photo?: string;
  }
  