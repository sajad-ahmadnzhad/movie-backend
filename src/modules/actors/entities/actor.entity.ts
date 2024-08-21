import { Movie } from "../../movies/entities/movie.entity";
import { User } from "../../auth/entities/user.entity";
import { Country } from "../../countries/entities/country.entity";
import { Industry } from "../../industries/entities/industry.entity";
import { BaseEntity } from "../../../common/abstracts/base.entity";
import {
  AfterInsert,
  AfterUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
} from "typeorm";

@Entity({ name: "actors" })
export class Actor extends BaseEntity {
  @Column({
    type: "varchar",
    unique: true,
    nullable: false,
    length: 50,
  })
  name: string;

  @Column({ type: "varchar", length: 200, nullable: true })
  bio: string;

  @Column({ type: "varchar", nullable: true })
  photo: string;

  @Column({ type: "int", nullable: false })
  countryId: number;

  @Column({ type: "int", nullable: false })
  industryId: number;

  @Column({ type: "int", nullable: true })
  createdById?: number;

  @ManyToOne(() => Country, (country) => country.actors, {
    onDelete: "CASCADE",
    nullable: false,
  })
  @JoinColumn()
  country: Country;

  @ManyToOne(() => Industry, (industry) => industry.actors, {
    onDelete: "CASCADE",
    nullable: false,
  })
  @JoinColumn()
  industry: Industry;

  @ManyToOne(() => User, (user) => user.actors, { onDelete: "SET NULL" })
  @JoinColumn()
  createdBy?: User;

  @ManyToMany(() => Movie, (movie) => movie.actors, { onDelete: "CASCADE" })
  movies: Movie[];
}
