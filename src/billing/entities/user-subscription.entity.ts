import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { Plan } from './plan.entity';

@Entity('user_subscriptions')
export class UserSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;

  @Column()
  planId: number;

  @ManyToOne(() => Plan, (plan) => plan.subscriptions)
  @JoinColumn({ name: 'planId' })
  plan: Relation<Plan>;

  @Column({ default: 'active' })
  status: string; // active, cancelled, expired, past_due

  // Billing
  @Column({ type: 'timestamp' })
  current_period_start: Date;

  @Column({ type: 'timestamp' })
  current_period_end: Date;

  @Column({ default: false })
  cancel_at_period_end: boolean;

  @Column({ type: 'timestamp', nullable: true })
  cancelled_at: Date;

  // Payment
  @Column({ nullable: true })
  payment_method: string; // placeholder

  @Column({ type: 'timestamp', nullable: true })
  last_payment_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  next_billing_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
