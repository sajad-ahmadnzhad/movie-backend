import { IsNotEmpty, IsInt } from "class-validator";
import { Transform } from "class-transformer";

export class RemoveCommentDto {
  @IsNotEmpty()
  @IsInt()
  @Transform(({ value }) => +value)
  commentId: number;
}
