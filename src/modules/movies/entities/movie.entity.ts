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

  @ManyToMany(() => Genre, (genre) => genre.movie, { onDelete: "SET NULL" })
  @JoinTable()
  genres: Genre[];

  @ManyToMany(() => Actor, (actor) => actor.movies, { onDelete: "SET NULL" })
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

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
