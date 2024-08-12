import { Actor } from "../../actors/entities/actor.entity";
import { User } from "../../auth/entities/user.entity";
import { Country } from "../../countries/entities/country.entity";
import { Genre } from "../../genres/entities/genre.entity";
import { Industry } from "../../industries/entities/industry.entity";
import {
  AfterLoad,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Bookmark } from "./bookmark.entity";
import { Like } from "./like.entity";
import { Comment } from "./comment.entity";
import { BaseEntity } from "../../../common/abstracts/base.entity";

@Entity({ name: "movies" })
export class Movie extends BaseEntity {
  @Column({ type: "varchar", nullable: false, length: 100 })
  title: string;

  @Column({ type: "text", nullable: false })
  description: string;

  @Column({ type: "integer", nullable: false })
  release_year: number;

  @Column({ type: "varchar", nullable: false })
  poster_URL: string;

  @Column({ type: "varchar", nullable: false })
  video_URL: string;

  @Column({ type: "integer", default: 0 })
  visitsCount: number;

  @Column({ type: "integer", default: 0 })
  likesCount: number;

  @Column({ type: "integer", default: 0 })
  bookmarksCount: number;

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
  bookmarks?: Bookmark[];

  @OneToMany(() => Like, (like) => like.movie)
  likes?: Like[];

  @OneToMany(() => Comment, (comment) => comment.movie)
  comments: Comment[];

  @AfterLoad()
  updateCountsAfterLoad() {
    this.likesCount = this.likes?.length || 0;
    this.bookmarksCount = this.bookmarks?.length || 0;
    this.likes = undefined;
    this.bookmarks = undefined;
  }
}
