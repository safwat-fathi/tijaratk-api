import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { Product } from './product.entity';

export enum InventoryEventType {
  SOLD = 'sold',
  RESTOCKED = 'restocked',
  ADJUSTMENT = 'adjustment',
}

@Entity('inventory_events')
export class InventoryEvent {
  @PrimaryGeneratedColumn()
  id: string;

  // Optional: Link to Product directly for easier queries?
  // But strict schema links to Variant.
  
  @Column({ name: 'product_id' })
  product_id: number;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Relation<Product>;

  @Column({ name: 'product_variant_id'})
  product_variant_id: string;

  @ManyToOne(() => ProductVariant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_variant_id' })
  variant: Relation<ProductVariant>;

  @Column({
    type: 'enum',
    enum: InventoryEventType,
  })
  type: InventoryEventType;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  quantity: number;

  @CreateDateColumn()
  created_at: Date;
}
