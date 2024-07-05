import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User.entity";

@Entity({ name: "tokens" })
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User , (user) => user.token)
  @JoinColumn()
  user: User;

  @Column({ type: "varchar", nullable: false })
  token: string;

  @BeforeInsert()
  setExpiration() {
    const expirationTime = new Date();

    expirationTime.setMinutes(expirationTime.getMinutes() + 10);
    this.createdAt = expirationTime;
  }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
