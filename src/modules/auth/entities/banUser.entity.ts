import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { BaseEntity } from '../../../common/abstracts/base.entity';

@Entity({ name: "bans" })
export class BanUser extends BaseEntity {
  @Column({ type: "varchar", nullable: false, unique: true })
  email: string;

  @ManyToOne(() => User, (user) => user.bans, { onDelete: "SET NULL" })
  @JoinColumn()
  bannedBy: User;
}
