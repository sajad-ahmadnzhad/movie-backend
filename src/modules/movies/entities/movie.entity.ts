import { Actor } from "../../actors/entities/actor.entity";
import { User } from "../../auth/entities/User.entity";
import { Country } from "../../countries/entities/country.entity";
import { Genre } from "../../genres/entities/genre.entity";
import { Industry } from "../../industries/entities/industry.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Bookmark } from "./Bookmark.entity";
import { Like } from "./like.entity";
import { Comment } from "./comment.entity";

@Entity({ name: "movies" })
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", nullable: false, length: 100 })
  title: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "integer", nullable: false })
  release_year: number;

  @Column({ type: "varchar", nullable: false })
  poster_URL: string;

  @Column({ type: "varchar", nullable: false })
  video_URL: string;

  @ManyToMany(() => Country, (country) => country.movies, {
    onDelete: "CASCADE",
  })
  @JoinTable()
  countries: Country[];

  @ManyToMany(() => Genre, (genre) => genre.movies, { onDelete: "CASCADE" })
  @JoinTable()
  genres: Genre[];

  @ManyToMany(() => Actor, (actor) => actor.movies, { onDelete: "CASCADE" })
  @JoinTable()
  actors: Actor[];

  @ManyToMany(() => Industry, (industry) => industry.movies, {
    onDelete: "CASCADE",
  })
  @JoinTable()
  industries: Industry[];

  @ManyToOne(() => User, (user) => user.movies, { onDelete: "SET NULL" })
  @JoinColumn()
  createdBy: User;

  @OneToMany(() => Bookmark, (bookmark) => bookmark.movie)
  bookmarks: Movie;

  @OneToMany(() => Like, (like) => like.movie)
  likes: Movie;

  @OneToMany(() => Comment, (comment) => comment.movie)
  comments: Comment[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
