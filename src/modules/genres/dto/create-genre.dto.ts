import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class CreateGenreDto {
  @IsString()
  @Transform(({ value }: { value: string }) => {
    value?.trim();
    return value?.toLowerCase();
  })
  @IsNotEmpty()
  @Length(3, 50)
  @ApiProperty({
    description: "The name of the genre",
    maxLength: 50,
    minimum: 3,
    example: "Action",
    type: "string",
  })
  name: string;

  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  @Length(5, 500)
  @ApiProperty({
    required: false,
    description: "The description of the genre",
    maxLength: 500,
    minLength: 5,
    type: "string",
    uniqueItems: true,
  })
  description?: string;
}
