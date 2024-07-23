import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { User } from "./user.entity";
import { BaseEntity } from "../../../common/abstracts/base.entity";

@Entity({ name: "tokens" })
export class Token extends BaseEntity {
  @OneToOne(() => User, (user) => user.token, { onDelete: "CASCADE" })
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
}
