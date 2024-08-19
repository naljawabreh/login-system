import {IsEmail, IsNotEmpty, IsString, IsEnum, IsBoolean} from 'class-validator';

export class BaseUserDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;
    @IsNotEmpty()
    @IsString()
    username: string;
    @IsNotEmpty()
    @IsString()
    registrationState: string;
    @IsNotEmpty()
    @IsBoolean()
    isResident: boolean;
  }
  
  export class PendingUserDto extends BaseUserDto {
    @IsNotEmpty()
    @IsString()
    otp: string;
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
    @IsEnum([BaseUserDto , PendingUserDto], {message: "valid usertype required"})
    user: BaseUserDto | PendingUserDto;
  }