import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

import { Store } from './store.entity';

/**
 * Store visit entity for tracking storefront page visits.
 * Used for dashboard analytics to show store visit counts.
 */
@Entity('store_visits')
export class StoreVisit {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'store_id' })
  store_id: number;

  @ManyToOne(() => Store, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'store_id' })
  store: Relation<Store>;

  /**
   * Hashed IP address for privacy.
   * We don't store raw IPs to comply with data protection.
   */
  @Column({ type: 'varchar', length: 64, nullable: true })
  visitor_ip_hash?: string;

  @Column({ type: 'text', nullable: true })
  user_agent?: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  referer?: string;

  @Index()
  @CreateDateColumn()
  created_at: Date;
}
