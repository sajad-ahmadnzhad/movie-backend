import { registerDecorator, ValidationArguments } from "class-validator";
import { SignupUserDto } from "../../modules/auth/dto/signupUser.dto";

interface ValidateArguments extends ValidationArguments {
  object: SignupUserDto;
}

export function ConfirmPassword() {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      validator: {
        defaultMessage() {
          return "ConfirmPassword is not equal to password";
        },
        validate(value: string, validationArguments: ValidateArguments) {
          return value == validationArguments?.object.password;
        },
      },
    });
  };
}
