import { IsInt, IsNotEmpty } from "class-validator";

export class LikeToggleDto {
  @IsNotEmpty()
  @IsInt()
  movieId: number;
}
