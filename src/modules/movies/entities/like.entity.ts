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

@Entity({ name: "likes" })
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: "CASCADE" })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Movie, (movie) => movie.likes, { onDelete: "CASCADE" })
  @JoinColumn()
  movie: Movie;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
