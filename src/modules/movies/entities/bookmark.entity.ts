import { User } from "../../auth/entities/user.entity";
import { Entity, JoinColumn, ManyToOne } from "typeorm";
import { Movie } from "./movie.entity";
import { BaseEntity } from "../../../common/abstracts/base.entity";

@Entity({ name: "bookmarks" })
export class Bookmark extends BaseEntity {
  @ManyToOne(() => User, (user) => user.bookmarks, {
    onDelete: "CASCADE",
    eager: true,
  })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Movie, (movie) => movie.bookmarks, { onDelete: "CASCADE" })
  @JoinColumn()
  movie: Movie;
}
