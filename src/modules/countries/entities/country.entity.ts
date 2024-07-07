import { User } from "../../auth/entities/User.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

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

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
