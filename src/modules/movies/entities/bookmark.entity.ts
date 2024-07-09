import { User } from "../../auth/entities/User.entity";
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Movie } from "./movie.entity";

@Entity({ name: "bookmarks" })
export class Bookmark {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.bookmarks, {
    onDelete: "CASCADE",
    eager: true,
  })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Movie, (movie) => movie.bookmarks, { onDelete: "CASCADE" })
  @JoinColumn()
  movie: Movie;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
