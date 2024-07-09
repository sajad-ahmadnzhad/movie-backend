import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Token } from "./token.entity";
import { BanUser } from "./banUser.entity";
import { Genre } from "../../genres/entities/genre.entity";
import { Country } from "../../countries/entities/country.entity";
import { Industry } from "../../industries/entities/industry.entity";
import { Actor } from "../../actors/entities/actor.entity";
import { Movie } from "../../movies/entities/movie.entity";
import { Bookmark } from "../../movies/entities/Bookmark.entity";
import { Like } from "../../movies/entities/like.entity";
import { Comment } from "../../movies/entities/comment.entity";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 40, nullable: false })
  name: string;

  @Column({ type: "varchar", length: 40, nullable: false, unique: true })
  username: string;

  @Column({ type: "varchar", nullable: false, unique: true })
  email: string;

  @Column({ type: "varchar", select: false, nullable: false })
  password: string;

  @Column({
    type: "varchar",
    default: "/uploads/user-avatar/custom-avatar.jpg",
  })
  avatarURL: string;

  @Column({ type: "boolean", default: false })
  isAdmin: boolean;

  @Column({ type: "boolean", default: false })
  isSuperAdmin: boolean;

  @Column({ type: "boolean", default: false })
  isVerifyEmail: boolean;

  @OneToOne(() => Token, (token) => token.user)
  token: Token;

  @OneToMany(() => BanUser, (banUser) => banUser.bannedBy)
  bans: BanUser[];

  @OneToMany(() => Genre, (genre) => genre.createdBy)
  genres: Genre[];

  @OneToMany(() => Country, (country) => country.createdBy)
  countries: Country[];

  @OneToMany(() => Industry, (industry) => industry.createdBy)
  industries: Industry[];

  @OneToMany(() => Actor, (actor) => actor.createdBy)
  actors: Actor[];

  @OneToMany(() => Movie, (movie) => movie.createdBy)
  movies: Movie[];

  @OneToMany(() => Bookmark, (bookmark) => bookmark.user)
  bookmarks: Bookmark[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @OneToMany(() => Comment, (comment) => comment.creator)
  comments: Comment[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
