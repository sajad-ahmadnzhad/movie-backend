import { User } from "../../auth/entities/User.entity";
import { Country } from "../../countries/entities/country.entity";
import { Industry } from "../../industries/entities/industry.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
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

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
