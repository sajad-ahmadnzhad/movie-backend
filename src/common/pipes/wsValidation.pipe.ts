import { Injectable, ValidationPipe } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { ValidationError } from "class-validator";

@Injectable()
export class WsValidationPipe extends ValidationPipe {
  createExceptionFactory() {
    return (validationErrors: ValidationError[] = []) => {
      if (this.isDetailedOutputDisabled) {
        return new WsException(validationErrors);
      }

      const errors = this.flattenValidationErrors(validationErrors);
      return new WsException(errors);
    };
  }
}
