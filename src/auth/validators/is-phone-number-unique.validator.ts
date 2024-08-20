import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, registerDecorator, ValidationOptions } from 'class-validator';
import { UsersService } from '../../users/users.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsPhoneNumberUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly usersService: UsersService) {}

  async validate(phoneNumber: string, args: ValidationArguments): Promise<boolean> {
    const user = await this.usersService.findOneByEmailOrPhoneNumber(phoneNumber);
    return !user; // Return true if phone number is not found (i.e., unique)
  }

  defaultMessage(args: ValidationArguments): string {
    return 'Phone number is already registered.';
  }
}

export function IsPhoneNumberUnique(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPhoneNumberUniqueConstraint,
    });
  };
}
