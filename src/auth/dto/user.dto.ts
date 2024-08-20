import {IsEmail, IsNotEmpty, IsString, IsEnum, IsBoolean} from 'class-validator';

export class BaseUserDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;
    @IsNotEmpty()
    @IsString()
    registrationState: string;
    @IsNotEmpty()
    @IsBoolean()
    isResident: boolean;
  }
  export class FullUserDto {
    readonly id: string;
    readonly email: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly phoneNumber: string;
    readonly isResident: boolean;
    readonly language?: string;
    readonly photoURL?: string;
    readonly registrationState: string;
    // Add any other fields you want to include
  }
  export class registrationResponseDto {
    @IsNotEmpty()
    @IsString()
    accessToken: string;
  }
  
  export class LoginResponseDto {
    @IsNotEmpty()
    @IsString()
    accessToken: string;
    @IsNotEmpty()
    @IsEnum([BaseUserDto], {message: "valid usertype required"})
    user: BaseUserDto;
  }