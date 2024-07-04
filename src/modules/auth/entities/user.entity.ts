import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 40, nullable: false })
  name: string;

  @Column({ type: "varchar", length: 40, nullable: false, unique: true })
  username: string;

  @Column({ type: "varchar", nullable: false, unique: true })
  email: string;

  @Column({ type: "varchar", select: false, nullable: false })
  password: string;

  @Column({
    type: "varchar",
    default: "/uploads/user-avatar/custom-avatar.jpg",
  })
  avatarURL: string;

  @Column({ type: "boolean", default: false })
  isAdmin: boolean;

  @Column({ type: "boolean", default: false })
  isSuperAdmin: boolean;

  @Column({ type: "boolean", default: false })
  isVerifyEmail: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
