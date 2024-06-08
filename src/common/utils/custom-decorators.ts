import { registerDecorator, ValidationArguments } from "class-validator";

export function ValidateObjectIds() {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      validator: {
        defaultMessage() {
          return this.errorMessage;
        },
        validate(value: string[] | string, args: ValidationArguments) {
          let hasError: boolean = false;

          if (!value) {
            this.errorMessage = `${args.property} should not be empty`;
            return false;
          }

          if (typeof value == "string") value = value.split(",");

          if (!Array.isArray(value)) {
            this.errorMessage = `${args.property} must be an array`;
            return false;
          }

          value = value.flat(Infinity);

          const duplicates: string[] = [];
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
            if (!value[i].match(/^[0-9a-fA-F]{24}$/)) {
              hasError = true;
              this.errorMessage = `invalid ObjectId ${args.property} index ${i}`;
              break;
            }
          }

          return !hasError;
        },
      },
    });
  };
}
