import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Token } from "./token.entity";
import { BanUser } from "./banUser.entity";
import { Genre } from "../../genres/entities/genre.entity";

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

  @OneToOne(() => Token, (token) => token.user)
  token: Token;

  @OneToMany(() => BanUser, (banUser) => banUser.bannedBy)
  bans: BanUser[];

  @OneToMany(() => Genre, (genre) => genre.createdBy)
  genres: Genre[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
