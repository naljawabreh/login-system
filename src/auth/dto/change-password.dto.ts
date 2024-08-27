import { ApiProperty } from "@nestjs/swagger";
import { 
    IsNotEmpty, 
    MinLength 
} from "class-validator";

export class ChangePasswordDTO {
    @ApiProperty({
        example: 'strong 8 char password',
        description: 'The password of the user',
        })
    @IsNotEmpty()
    readonly currentPassword: string;
    
    @ApiProperty({
        example: 'strong 8 char password',
        description: 'The password of the user',
        })
    @IsNotEmpty()
    @MinLength(8)
    readonly newPassword: string;
  }
  