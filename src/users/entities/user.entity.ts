import { decrypt, encrypt } from 'src/common/utils/encryption.util';
import { FacebookPage } from 'src/facebook/entities/facebook-page.entity';
import { FacebookPageSubscription } from 'src/facebook-page-subscription/entities/facebook-page-subscription.entity';
import { Product } from 'src/products/entities/product.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
@Unique(['email'])
@Unique(['facebookId'])
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ type: 'varchar' })
  facebookId: string;

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

  @Column({
    select: false,
    nullable: true,
    transformer: {
      to: (value: string | null) => {
        const encryptedValue = value ? encrypt(value) : null;

        return encryptedValue;
      },
      from: (value: string | null) => (value ? decrypt(value) : null),
    },
  })
  fb_access_token?: string;

  @Column({ nullable: true })
  reset_password_token?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
