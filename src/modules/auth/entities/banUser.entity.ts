import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User.entity";

@Entity({ name: "banUser" })
export class BanUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", nullable: false, unique: true })
  email: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  createdBy: User;
}
