import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateMessageDto } from './dto/create-message.dto';
import { CustomersService } from 'src/customers/customers.service';
import { ProductsService } from 'src/products/products.service';
import { Message } from './entities/message.entity';
import { TagsService } from 'src/tags/tags.service';
import { Tag } from 'src/tags/entities/tag.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    private readonly customersService: CustomersService,
    private readonly productsService: ProductsService,
    private tagsService: TagsService,
  ) {}

  async create(dto: CreateMessageDto) {
    // Retrieve the customer
    const customer = await this.customersService.findOne(dto.customerId);
    if (!customer) {
      throw new Error(`Customer with ID ${dto.customerId} not found`);
    }

    // Retrieve the product if productId is provided
    let product = null;
    if (dto.productId) {
      product = await this.productsService.findOne(dto.productId);
      if (!product) {
        throw new Error(`Product with ID ${dto.productId} not found`);
      }
    }

    const message = this.messageRepo.create({
      ...dto,
      customer,
      product,
    });

    return this.messageRepo.save(message);
  }

  async findAll() {
    // Return with relationships
    return this.messageRepo.find({ relations: ['customer', 'product'] });
  }

  async findOne(id: number) {
    return this.messageRepo.findOne({
      where: { id },
      relations: ['customer', 'product'],
    });
  }

  async update(
    id: number,
    message: Partial<Message>,
    tagNames?: string[],
  ) {
    if (tagNames) {
      const tags = await this.preloadTagsByName(tagNames);
      message.tags = tags;
    }

    await this.messageRepo.update(id, message);
    const updatedMessage = await this.messageRepo.findOne({
      where: { id },
      relations: ['tags'],
    });

    if (!updatedMessage) {
      throw new NotFoundException(`Message #${id} not found`);
    }

    return updatedMessage;
  }

  private async preloadTagsByName(names: string[]): Promise<Tag[]> {
    const existingTags = await Promise.all(
      names.map((name) => this.tagsService.findByName(name)),
    );

    const tags: Tag[] = [];

    for (let i = 0; i < names.length; i++) {
      const tag = existingTags[i];
      if (tag) {
        tags.push(tag);
      } else {
        const newTag = await this.tagsService.create({ name: names[i] });
        tags.push(newTag);
      }
    }

    return tags;
  }
}
