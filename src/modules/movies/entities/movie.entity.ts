import { Actor } from "../../actors/entities/actor.entity";
import { User } from "../../auth/entities/user.entity";
import { Country } from "../../countries/entities/country.entity";
import { Genre } from "../../genres/entities/genre.entity";
import { Industry } from "../../industries/entities/industry.entity";
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Bookmark } from "./bookmark.entity";
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
  bookmarks: Bookmark[];

  @OneToMany(() => Like, (like) => like.movie)
  likes: Like[];

  @OneToMany(() => Comment, (comment) => comment.movie)
  comments: Comment[];

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  @BeforeInsert()
  setCreatedAt() {
    this.createdAt = new Date();
  }

  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = new Date();
  }
}
