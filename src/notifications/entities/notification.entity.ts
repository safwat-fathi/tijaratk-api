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

export enum NotificationType {
  COMMENT = 'comment',
  MESSAGE = 'message',
  PRODUCT_ORDER = 'product order',
  SYSTEM = 'system',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column({ enum: NotificationType })
  type: NotificationType;

  @Column({ default: false })
  is_read: boolean;

  @ManyToOne(() => User, (user) => user.notifications)
  user: Relation<User>;

  @Column({ type: 'varchar', nullable: true })
  sender_id: string;

  @Column({ type: 'varchar', nullable: true })
  sender_name: string;

  @Column({ type: 'varchar', nullable: true })
  productName: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
