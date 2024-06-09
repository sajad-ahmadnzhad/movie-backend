import {
  BadRequestException,
  ParseIntPipeOptions,
  PipeTransform,
} from "@nestjs/common";
import { isValidObjectId } from "mongoose";

export class IsValidObjectIdPipe implements PipeTransform {
  constructor(private readonly options?: ParseIntPipeOptions) {}
  transform(value: string) {
    if (this.options?.optional && !value) {
      return value;
    }

    if (!isValidObjectId(value))
      throw new BadRequestException("This id is not from mongodb");

    return value;
  }
}
