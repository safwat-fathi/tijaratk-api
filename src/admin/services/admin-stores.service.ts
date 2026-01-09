import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from 'src/stores/entities/store.entity';
import { Repository, ILike, Between, FindOptionsWhere } from 'typeorm';

@Injectable()
export class AdminStoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const where: FindOptionsWhere<Store> = {};

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    if (startDate && endDate) {
      where.created_at = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.created_at = Between(new Date(startDate), new Date()); // From start to now
    }

    const [stores, total] = await this.storeRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
      relations: ['owner'], // Include owner details
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
    const store = await this.storeRepository.findOne({ where: { id } });
    if (!store) {
      throw new Error('Store not found');
    }

    store.is_active = !store.is_active; // Toggling active status instead of is_published
    return this.storeRepository.save(store);
  }
}
