import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Relation,
} from 'typeorm';
import { Store } from '../../stores/entities/store.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Order } from './order.entity';

export enum CustomRequestStatus {
  PENDING = 'pending',
  QUOTED = 'quoted',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

@Entity('custom_order_requests')
export class CustomOrderRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'store_id' })
  store_id: number;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Relation<Store>;

  // Customer relation - aligned with Order entity pattern
  @Column({ name: 'customer_id', nullable: true })
  customer_id: number;

  @ManyToOne(() => Customer, (customer) => customer.customOrderRequests, {
    nullable: true,
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Relation<Customer>;

  // Snapshot fields for guest checkout (when customer is not resolved)
  @Column({ type: 'varchar', length: 255 })
  buyer_name: string;

  @Column({ type: 'varchar', length: 32 })
  buyer_phone: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  budget: number;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({
    type: 'enum',
    enum: CustomRequestStatus,
    default: CustomRequestStatus.PENDING,
  })
  status: CustomRequestStatus;

  // Quote details (filled by seller)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  quoted_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  quoted_shipping_cost: number;

  @Column({ type: 'text', nullable: true })
  seller_notes: string;

  @Column({ type: 'timestamp', nullable: true })
  quoted_at: Date;

  // The resulting order if accepted
  @ManyToOne(() => Order, { nullable: true })
  order: Relation<Order>;

  @Column({ nullable: true })
  orderId: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
