import { Movie } from "../../movies/entities/movie.entity";
import { User } from "../../auth/entities/User.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "genres" })
export class Genre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", unique: true, nullable: false, length: 50 })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @ManyToOne(() => User, (user) => user.genres, { onDelete: "SET NULL" })
  @JoinColumn()
  createdBy: User;

  @ManyToMany(() => Movie, (movie) => movie.genres)
  movie: Movie[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
