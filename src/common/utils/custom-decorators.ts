import { registerDecorator, ValidationArguments } from "class-validator";
import { SignupUserDto } from "../../modules/auth/dto/signupUser.dto";

export function ValidateIds() {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      validator: {
        defaultMessage() {
          return this.errorMessage;
        },
        validate(value: number[] | number, args: ValidationArguments) {
          let hasError: boolean = false;

          if (!value) {
            this.errorMessage = `${args.property} should not be empty`;
            return false;
          }

          if (!Array.isArray(value)) {
            this.errorMessage = `${args.property} must be an array`;
            return false;
          }

          value = value.flat(Infinity);
          const duplicates: number[] = [];
          const seen = new Set();

          //* Find duplicated keys
          for (const num of value) {
            if (seen.has(num)) {
              duplicates.push(num);
            } else {
              seen.add(num);
            }
          }

          if (duplicates.length) {
            this.errorMessage = `duplicated keys in ${args.property} ${duplicates[0]}`;
            return false;
          }

          for (let i = 0; i < value.length; i++) {
            if (typeof value[i] !== "number" || isNaN(value[i])) {
              hasError = true;
              this.errorMessage = `invalid id ${args.property} index ${i}`;
              break;
            }
          }

          return !hasError;
        },
      },
    });
  };
}

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
