import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

@Entity('order_links')
@Unique(['token'])
export class OrderLink {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: 'order_id' }) // Match existing Order ID type (number)
  order_id: number;

  @OneToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Relation<Order>;

  @Column({ type: 'varchar', length: 64 })
  token: string;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
