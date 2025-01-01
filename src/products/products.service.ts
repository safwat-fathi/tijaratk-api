import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto) {
    const product = this.productRepo.create(dto);
    return this.productRepo.save(product);
  }

  async findAll() {
    return this.productRepo.find();
  }

  async findOne(id: number) {
    return this.productRepo.findOne({ where: { id } });
  }

  async update(id: number, dto: Partial<CreateProductDto>) {
    await this.productRepo.update(id, dto);
    return this.productRepo.findOne({ where: { id } });
  }

  async remove(id: number) {
    return this.productRepo.delete(id);
  }
}
