import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersModule } from 'src/customers/customers.module';
import { ProductsModule } from 'src/products/products.module';
import { Message } from './entities/message.entity';

import { Tag } from 'src/tags/entities/tag.entity';
import { MessageTag } from './entities/message-tag.entity';
import { TagsModule } from 'src/tags/tags.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, MessageTag, Tag]),
    CustomersModule,
    ProductsModule,
    TagsModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
