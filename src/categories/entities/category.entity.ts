import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  key: string;

  @Column()
  name_en: string;

  @Column()
  name_ar: string;

  @Column('jsonb', { default: [] })
  suggested_sub_categories: { name_en: string; name_ar: string }[];

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon?: string;

  @Column({ default: 0 })
  sort_order: number;

  @Column({ default: true })
  is_active: boolean;
}
