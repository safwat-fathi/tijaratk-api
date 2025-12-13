import { Category } from 'src/categories/entities/category.entity';
import { Storefront } from 'src/storefronts/entities/storefront.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('storefront_category')
export class StorefrontCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  storefrontId: number;

  @OneToOne(() => Storefront)
  @JoinColumn({ name: 'storefrontId' })
  storefront: Relation<Storefront>;

  @Column()
  primaryCategoryId: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'primaryCategoryId' })
  primaryCategory: Relation<Category>;

  @Column({ nullable: true })
  secondaryCategoryId: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'secondaryCategoryId' })
  secondaryCategory: Relation<Category>;
}
