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
}
