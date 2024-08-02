import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Movie } from "./movie.entity";
import { User } from "../../auth/entities/user.entity";
import { BaseEntity } from "../../../common/abstracts/base.entity";

@Entity({ name: "comments" })
export class Comment extends BaseEntity {
  @Column({ type: "varchar", nullable: false })
  body: string;

  @Column({ type: "boolean", default: false })
  isAccept: boolean;

  @Column({ type: "boolean", default: false })
  isReject: boolean;

  @Column({ type: "integer", default: 5 })
  rating: number;

  @Column({ type: "boolean", default: false })
  isEdit: boolean;

  @Column({ type: "boolean", default: false })
  isReviewed: boolean;

  @ManyToOne(() => Comment, (comment) => comment.replies)
  parent: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent, {
    onDelete: "CASCADE",
  })
  replies: Comment[];

  @ManyToOne(() => User, (user) => user.comments, { onDelete: "CASCADE" })
  @JoinColumn()
  creator: User;

  @ManyToOne(() => Movie, (movie) => movie.comments, { onDelete: "CASCADE" })
  @JoinColumn()
  movie: Movie;
}
