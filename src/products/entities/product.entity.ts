import { Post } from 'src/posts/entities/post.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Store } from '../../stores/entities/store.entity';
import { InventoryEvent } from './inventory-event.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('products')
@Unique(['store', 'barcode'])
export class Product {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: 'store_id' })
  store_id: string;

  @ManyToOne(() => Store, (store) => store.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'store_id' })
  store: Relation<Store>;

  @Column()
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  barcode: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  slug?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  image_url?: string; // Renamed from main_image to match schema, or kept? Schema said image_url.

  @Column({ type: 'json', nullable: true })
  images?: string[];

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
  })
  variants: Relation<ProductVariant[]>;

  @OneToMany(() => InventoryEvent, (event) => event.product)
  inventory_events: Relation<InventoryEvent[]>;

  @OneToMany(() => Post, (post) => post.product)
  posts: Relation<Post[]>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
