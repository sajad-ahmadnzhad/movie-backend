import { Transform } from "class-transformer";
import { IsNumber, IsOptional, Matches } from "class-validator";

export class FilterMoviesDto {
  @IsOptional()
  @Matches(/^[0-9a-fA-F]{24}$/, { message: "genre id is not from mongodb" })
  genre?: string;
  @IsOptional()
  @Matches(/^[0-9a-fA-F]{24}$/, { message: "country id is not from mongodb" })
  country?: string;
  @IsOptional()
  @Matches(/^[0-9a-fA-F]{24}$/, { message: "actor id is not from mongodb" })
  actor?: string;
  @IsOptional()
  @Matches(/^[0-9a-fA-F]{24}$/, { message: "industry id is not from mongodb" })
  industry?: string;
  @IsOptional()
  @Transform(({ value }) => +value)
  @IsNumber()
  limit?: number;
  @Transform(({ value }) => +value)
  @IsOptional()
  @IsNumber()
  page?: number;
}
