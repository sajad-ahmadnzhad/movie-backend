import { IsNotEmpty, IsInt, IsOptional } from "class-validator";
import { Transform } from "class-transformer";

export class MovieCommentDto {
  @IsNotEmpty()
  @IsInt()
  @Transform(({ value }) => +value)
  movieId: number;

  @IsNotEmpty()
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => +value)
  limit?: number;

  @IsNotEmpty()
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => +value)
  page?: number;
}
