import { Movie } from "../../movies/entities/movie.entity";
import { Actor } from "../../actors/entities/actor.entity";
import { User } from "../../auth/entities/User.entity";
import { Country } from "../../countries/entities/country.entity";
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity({ name: "industries" })
export class Industry {
  @PrimaryGeneratedColumn()
  id: number;

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
