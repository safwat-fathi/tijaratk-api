import { Category } from 'src/categories/entities/category.entity';
import { Storefront } from 'src/storefronts/entities/storefront.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('sub_categories')
export class SubCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  storefrontId: number;

  @ManyToOne(() => Storefront, (storefront) => storefront.subCategories)
  @JoinColumn({ name: 'storefrontId' })
  storefront: Relation<Storefront>;

  @Column()
  categoryId: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Relation<Category>;

  @Column()
  name: string;

  @Column({ default: false })
  is_custom: boolean;
}
