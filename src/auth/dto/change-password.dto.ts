import { IsNotEmpty, MinLength } from "class-validator";

export class ChangePasswordDTO {
    @IsNotEmpty()
    currentPassword: string;
  
    @IsNotEmpty()
    @MinLength(6)
    newPassword: string;
  }
  