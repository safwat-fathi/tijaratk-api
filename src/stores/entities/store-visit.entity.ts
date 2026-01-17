import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Index,
} from 'typeorm';
import { Store } from './store.entity';

/**
 * Store visit entity for tracking storefront page visits.
 * Used for dashboard analytics to show store visit counts.
 */
@Entity('store_visits')
@Index(['store_id', 'created_at'])
@Index(['store_id', 'session_id'])
export class StoreVisit {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'store_id' })
  store_id: number;

  @ManyToOne(() => Store, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'store_id' })
  store: Relation<Store>;

  /** Session ID stored in cookie */
  @Column({ type: 'uuid' })
  session_id: string;

  /** Optional privacy-safe IP hash */
  @Column({ type: 'varchar', length: 64, nullable: true })
  visitor_ip_hash?: string;

  @Column({ type: 'text', nullable: true })
  user_agent?: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  referer?: string;

  @CreateDateColumn()
  created_at: Date;
}
