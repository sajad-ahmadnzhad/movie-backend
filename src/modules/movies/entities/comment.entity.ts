import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from "typeorm";
import { Movie } from "./movie.entity";
import { User } from "../../auth/entities/User.entity";

@Entity({ name: "comments" })
@Tree("closure-table")
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

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

  @TreeParent({ onDelete: "CASCADE" })
  parentComment: Comment;

  @TreeChildren({ cascade: true })
  replies: Comment[];

  @ManyToOne(() => User, (user) => user.comments, { onDelete: "CASCADE" })
  @JoinColumn()
  creator: User;

  @ManyToOne(() => Movie, (movie) => movie.comments, { onDelete: "CASCADE" })
  @JoinColumn()
  movie: Movie;

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
