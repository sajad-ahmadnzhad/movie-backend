import { Industry } from "../../industries/entities/industry.entity";
import { User } from "../../auth/entities/User.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Actor } from "../../actors/entities/actor.entity";
import { Movie } from "../../movies/entities/movie.entity";

@Entity({ name: "countries" })
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", unique: true, nullable: false, length: 50 })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "varchar", nullable: true })
  flag_image_URL: string;

  @ManyToOne(() => User, (user) => user.countries, { onDelete: "SET NULL" })
  @JoinColumn()
  createdBy: User;

  @OneToMany(() => Industry, (industry) => industry.country)
  industries: Industry[];

  @OneToMany(() => Actor, (actor) => actor.country)
  actors: Actor[];

  @ManyToMany(() => Movie, (movie) => movie.countries)
  movies: Movie[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
