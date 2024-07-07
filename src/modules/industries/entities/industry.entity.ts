import { User } from "../../auth/entities/User.entity";
import { Country } from "../../countries/entities/country.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
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

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
