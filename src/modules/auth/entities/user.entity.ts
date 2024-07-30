import { Column, Entity, OneToMany, OneToOne } from "typeorm";
import { Token } from "./token.entity";
import { BanUser } from "./banUser.entity";
import { Genre } from "../../genres/entities/genre.entity";
import { Country } from "../../countries/entities/country.entity";
import { Industry } from "../../industries/entities/industry.entity";
import { Actor } from "../../actors/entities/actor.entity";
import { Movie } from "../../movies/entities/movie.entity";
import { Bookmark } from "../../movies/entities/bookmark.entity";
import { Like } from "../../movies/entities/like.entity";
import { Comment } from "../../movies/entities/comment.entity";
import { Roles } from "../../../common/enums/roles.enum";
import { BaseEntity } from "../../../common/abstracts/base.entity";

@Entity({ name: "users" })
export class User extends BaseEntity {
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
  isVerifyEmail: boolean;

  @Column({ type: "enum", enum: Roles, default: Roles.USER })
  role: Roles;

  @OneToOne(() => Token, (token) => token.user, { onDelete: "SET NULL" })
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
}
