import { Movie } from "../../movies/entities/movie.entity";
import { User } from "../../auth/entities/User.entity";
import { Country } from "../../countries/entities/country.entity";
import { Industry } from "../../industries/entities/industry.entity";
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity({ name: "actors" })
export class Actor {
  @PrimaryGeneratedColumn()
  id: number;

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

  @ManyToOne(() => Country, (country) => country.actors, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  country: Country;

  @ManyToOne(() => Industry, (industry) => industry.actors, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  industry: Industry;

  @ManyToOne(() => User, (user) => user.actors, { onDelete: "SET NULL" })
  @JoinColumn()
  createdBy: User;

  @ManyToMany(() => Movie, (movie) => movie.actors, { onDelete: "CASCADE" })
  movies: Movie[];

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
