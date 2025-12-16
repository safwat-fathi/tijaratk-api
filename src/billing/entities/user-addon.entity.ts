import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { Addon } from './addon.entity';

@Entity('user_addons')
export class UserAddon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;

  @Column()
  addonId: number;

  @ManyToOne(() => Addon)
  @JoinColumn({ name: 'addonId' })
  addon: Relation<Addon>;

  @Column({ type: 'int', default: 1 })
  quantity_purchased: number;

  @Column({ default: 'active' })
  status: string; // active, expired, cancelled

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  purchased_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  next_renewal_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
