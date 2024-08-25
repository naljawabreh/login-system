import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, Matches, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'John',
    description: 'The first name of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly lastName?: string;

  @ApiProperty({
    example: '00970512345678',
    description: 'The phone number of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^(0097[02]5)\d{8}$/, {
    message:
      'Phone number must start with 009705 or 009725 and consist of 14 digits.',
  })
  readonly phoneNumber?: string;

  @ApiProperty({
    example: true,
    description: 'Indicates if the user is a resident',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly isResident?: boolean;
}
