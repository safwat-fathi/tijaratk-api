import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { MessageTag } from 'src/messages/entities/message-tag.entity';

import { Message } from 'src/messages/entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tag, Message, MessageTag]),
  ],
  controllers: [TagsController],
  providers: [TagsService],
	exports: [TagsService],
})
export class TagsModule {}
