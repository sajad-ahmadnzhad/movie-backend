import { User } from "../../auth/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Movie } from "./movie.entity";
import { BaseEntity } from "../../../common/abstracts/base.entity";

@Entity({ name: "likes" })
export class Like extends BaseEntity {
  @ManyToOne(() => User, (user) => user.likes, {
    onDelete: "CASCADE",
    eager: true,
  })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Movie, (movie) => movie.likes, { onDelete: "CASCADE" })
  @JoinColumn()
  movie: Movie;
}
