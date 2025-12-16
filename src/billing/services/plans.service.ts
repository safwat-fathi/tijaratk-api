import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Plan } from '../entities/plan.entity';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}

  async findAll(): Promise<Plan[]> {
    return this.planRepository.find({
      where: { is_active: true },
      order: { display_order: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Plan> {
    const plan = await this.planRepository.findOne({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }

    return plan;
  }

  async findBySlug(slug: string): Promise<Plan> {
    const plan = await this.planRepository.findOne({
      where: { slug },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with slug ${slug} not found`);
    }

    return plan;
  }

  async comparePlans(
    currentPlanId: number,
    targetPlanId: number,
  ): Promise<{ current: Plan; target: Plan }> {
    const current = await this.findOne(currentPlanId);
    const target = await this.findOne(targetPlanId);

    return { current, target };
  }
}
