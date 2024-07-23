import { Movie } from "../../movies/entities/movie.entity";
import { Actor } from "../../actors/entities/actor.entity";
import { User } from "../../auth/entities/user.entity";
import { Country } from "../../countries/entities/country.entity";
import { BaseEntity } from "../../../common/abstracts/base.entity";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from "typeorm";

@Entity({ name: "industries" })
export class Industry extends BaseEntity {
  @Column({
    type: "varchar",
    unique: true,
    length: 50,
    nullable: false,
  })
  name: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @ManyToOne(() => Country, (country) => country.industries, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  country: Country;

  @ManyToOne(() => User, (user) => user.industries, { onDelete: "SET NULL" })
  @JoinColumn()
  createdBy: User;

  @OneToMany(() => Actor, (actor) => actor.industry)
  actors: Actor[];

  @ManyToMany(() => Movie, (movie) => movie.industries, { onDelete: "CASCADE" })
  movies: Movie[];
}
