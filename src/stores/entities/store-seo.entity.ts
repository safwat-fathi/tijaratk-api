import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Store } from './store.entity';

/**
 * OpenGraph metadata for social previews
 */
export interface OgMetadata {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
}

/**
 * Twitter Card metadata
 */
export interface TwitterMetadata {
  card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  site?: string;
  image?: string;
}

/**
 * Schema.org structured data (flexible object)
 */
export type SchemaOrgData = Record<string, unknown>;

/**
 * Store SEO entity - separate table for SEO configuration.
 *
 * Benefits:
 * - SEO config changes independently from store data
 * - Optional (physical stores don't need it)
 * - Has different lifecycle (marketing vs operations)
 * - Can grow (OpenGraph, Twitter, Schema.org, locales) without migrations
 * - Keeps stores table clean and focused on business logic
 */
@Entity('store_seo')
export class StoreSeo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  store_id: number;

  @OneToOne(() => Store, (store) => store.seo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'store_id' })
  store: Relation<Store>;

  /**
   * Core SEO - Page title (max 60 chars recommended)
   */
  @Column({ type: 'text', nullable: true })
  title?: string;

  /**
   * Core SEO - Meta description (max 160 chars recommended)
   */
  @Column({ type: 'text', nullable: true })
  description?: string;

  /**
   * Indexing control - whether search engines should index this store
   */
  @Column({ default: true })
  is_indexable: boolean;

  /**
   * Canonical URL for SEO (prevents duplicate content issues)
   */
  @Column({ type: 'text', nullable: true })
  canonical_url?: string;

  /**
   * OpenGraph metadata for social previews (Facebook, LinkedIn, etc.)
   */
  @Column({ type: 'jsonb', nullable: true })
  og?: OgMetadata;

  /**
   * Twitter Card metadata
   */
  @Column({ type: 'jsonb', nullable: true })
  twitter?: TwitterMetadata;

  /**
   * Schema.org structured data for rich search results
   */
  @Column({ type: 'jsonb', nullable: true })
  schema_org?: SchemaOrgData;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

	@DeleteDateColumn()
	deleted_at: Date;
}
