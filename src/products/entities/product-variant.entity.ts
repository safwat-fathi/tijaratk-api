import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: 'product_id' }) // Will be updated to UUID or stay int based on Product
  product_id: number; // Keeping as number to match existing Product entity for now, or should be UUID? Plan said UUID.

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Relation<Product>;

  @Column({ type: 'varchar', length: 100 })
  label: string; // '1 kg', 'Box'

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit: string; // 'kg', 'piece'

  @Column({ type: 'numeric', precision: 10, scale: 3, nullable: true })
  unit_value: number; // 1, 0.5

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @Column({ default: false })
  is_default: boolean;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
