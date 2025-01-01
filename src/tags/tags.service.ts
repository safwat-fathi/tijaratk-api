// src/tags/tags.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
  ) {}

  findAll(): Promise<Tag[]> {
    return this.tagsRepository.find();
  }

  

  async create(tag: Partial<Tag>): Promise<Tag> {
    const newTag = this.tagsRepository.create(tag);
    return this.tagsRepository.save(newTag);
  }

  async update(id: number, tag: Partial<Tag>): Promise<Tag> {
    await this.tagsRepository.update({ id }, tag);

    const updatedTag = await this.tagsRepository.findOneBy({ id });

    if (!updatedTag) {
      throw new NotFoundException(`Tag ${name} not found`);
    }

    return updatedTag;
  }

  async remove(id: number): Promise<void> {
    await this.tagsRepository.delete(id);
  }

  async findByName(name: string): Promise<Tag> {
    return this.tagsRepository.findOneBy({ name });
  }
}
