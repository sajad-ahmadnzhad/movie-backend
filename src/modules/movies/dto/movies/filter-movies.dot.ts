import { Transform } from "class-transformer";
import { IsInt, IsNumber, IsOptional, Max } from "class-validator";

export class FilterMoviesDto {
  @IsOptional()
  @IsNumber()
  @IsInt()
  @Transform(({ value }) => +value)
  genre?: number;

  @IsOptional()
  @IsNumber()
  @IsInt()
  @Transform(({ value }) => +value)
  country?: number;

  @IsOptional()
  @IsNumber()
  @IsInt()
  @Transform(({ value }) => +value)
  actor?: number;

  @IsOptional()
  @IsNumber()
  @IsInt()
  @Transform(({ value }) => +value)
  industry?: number;

  @IsOptional()
  @Transform(({ value }) => +value)
  @IsNumber()
  @IsInt()
  limit?: number;

  @Transform(({ value }) => +value)
  @IsOptional()
  @IsNumber()
  @IsInt()
  page?: number;

  @Transform(({ value }) => +value)
  @IsOptional()
  @IsNumber()
  @IsInt()
  @Max(new Date().getFullYear())
  release_year?: number;
}
