import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

export enum SubscribedFields {
  FEED = 'feed',
  MESSAGES = 'messages',
}

@Entity()
export class FacebookPageSubscription {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  page_id: string;

  @ManyToOne(() => User, (user) => user.facebook_page_subscriptions)
  user: Relation<User>;

  @Column({ type: 'enum', enum: SubscribedFields, array: true })
  subscribed_fields: SubscribedFields[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
