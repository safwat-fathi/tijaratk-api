import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Relation,
} from 'typeorm';
import { Storefront } from '../../storefronts/entities/storefront.entity';
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

  @ManyToOne(() => Storefront, { onDelete: 'CASCADE' })
  storefront: Relation<Storefront>;

  @Column()
  storefrontId: number;

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
