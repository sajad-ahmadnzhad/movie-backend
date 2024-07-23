import { Movie } from "../../movies/entities/movie.entity";
import { User } from "../../auth/entities/user.entity";
import { BaseEntity } from "../../../common/abstracts/base.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from "typeorm";

@Entity({ name: "genres" })
export class Genre extends BaseEntity {
  @Column({ type: "varchar", unique: true, nullable: false, length: 50 })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @ManyToOne(() => User, (user) => user.genres, { onDelete: "SET NULL" })
  @JoinColumn()
  createdBy: User;

  @ManyToMany(() => Movie, (movie) => movie.genres, { onDelete: "CASCADE" })
  movies: Movie[];
}
