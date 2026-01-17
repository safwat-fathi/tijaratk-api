import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import type { CustomOrderRequest } from '../../orders/entities/custom-order-request.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ nullable: true })
  user_id: number;

  @ManyToOne('User', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: Relation<any>;

  @Column({ type: 'varchar', length: 120, nullable: true })
  name: string;

  @Index()
  @Column({ type: 'varchar', length: 20 })
  whatsapp_number: string;

  @OneToMany(() => Order, (order) => order.customer)
  orders: Relation<Order[]>;

  @OneToMany(
    'CustomOrderRequest',
    (request: CustomOrderRequest) => request.customer,
  )
  customOrderRequests: Relation<CustomOrderRequest[]>;

  @CreateDateColumn()
  created_at: Date;
}
