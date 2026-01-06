import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Storefront } from 'src/storefronts/entities/storefront.entity';
import { Repository, ILike, Between, FindOptionsWhere } from 'typeorm';

@Injectable()
export class AdminStoresService {
  constructor(
    @InjectRepository(Storefront)
    private readonly storefrontRepository: Repository<Storefront>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const where: FindOptionsWhere<Storefront> = {};

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    if (startDate && endDate) {
      where.created_at = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.created_at = Between(new Date(startDate), new Date()); // From start to now
    }

    const [stores, total] = await this.storefrontRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
      relations: ['user'], // Include owner details
    });

    return {
      data: stores,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async togglePublish(id: number) {
    const store = await this.storefrontRepository.findOne({ where: { id } });
    if (!store) {
      throw new Error('Store not found');
    }

    store.is_published = !store.is_published;
    return this.storefrontRepository.save(store);
  }
}
