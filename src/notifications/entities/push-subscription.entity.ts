import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity('push_subscriptions')
@Unique(['endpoint'])
export class PushSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  endpoint: string;

  @Column('text')
  p256dh: string; // Public key for encryption

  @Column('text')
  auth: string; // Auth secret

  @Column({ nullable: true })
  user_agent: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
