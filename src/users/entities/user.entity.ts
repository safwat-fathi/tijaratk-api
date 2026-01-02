import { UserSubscription } from 'src/billing/entities/user-subscription.entity';
import { FacebookPage } from 'src/facebook/entities/facebook-page.entity';
import { FacebookPageSubscription } from 'src/facebook-page-subscription/entities/facebook-page-subscription.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { Product } from 'src/products/entities/product.entity';
import { Storefront } from 'src/storefronts/entities/storefront.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { UserIdentity } from './user-identity.entity';
import { Exclude } from 'class-transformer';
import { genSalt, hash } from 'bcryptjs';

@Entity('users')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => UserSubscription, (sub) => sub.user, {
    cascade: true,
  })
  userSubscription: Relation<UserSubscription>;

  @Column({ nullable: true })
  email?: string;

  @Exclude()
  @Column({ nullable: true, select: false })
  password?: string;

  @Column({ default: false })
  is_active: boolean;

  // Social identities (Facebook, Google, etc.)
  @OneToMany(() => UserIdentity, (identity) => identity.user, { cascade: true })
  identities?: Relation<UserIdentity[]>;

  @OneToMany(() => FacebookPage, (page) => page.user)
  facebook_pages?: Relation<FacebookPage[]>;

  @OneToMany(() => FacebookPageSubscription, (pageSub) => pageSub.user)
  facebook_page_subscriptions?: Relation<FacebookPageSubscription[]>;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @ManyToOne(() => Product, (product) => product.user, {
    cascade: true,
    nullable: true,
  })
  products?: Relation<Product[]>;

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Relation<Notification[]>;

  @OneToOne(() => Storefront, (storefront) => storefront.user)
  storefront?: Relation<Storefront>;

  @Column({ nullable: true })
  reset_password_token?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const salt = await genSalt();
      this.password = await hash(this.password, salt);
    }
  }
}
