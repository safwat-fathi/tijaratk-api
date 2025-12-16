import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PurchaseAddonDto } from '../dto/purchase-addon.dto';
import { Addon } from '../entities/addon.entity';
import { UserAddon } from '../entities/user-addon.entity';

@Injectable()
export class AddonsService {
  constructor(
    @InjectRepository(Addon)
    private readonly addonRepository: Repository<Addon>,
    @InjectRepository(UserAddon)
    private readonly userAddonRepository: Repository<UserAddon>,
  ) {}

  async findAll(userPlanSlug?: string): Promise<Addon[]> {
    const query = this.addonRepository
      .createQueryBuilder('addon')
      .where('addon.is_active = :isActive', { isActive: true })
      .orderBy('addon.display_order', 'ASC');

    // If userPlanSlug is likely provided in future, we could filter by JSON containment
    // For now, return all active addons.
    // Ideally: logical filtering if database supports JSON array contains check easily
    // or fetch all and filter in memory if list is small (it is small: 4 addons)

    const addons = await query.getMany();

    if (userPlanSlug) {
      return addons.filter(
        (addon) =>
          !addon.available_for_plans ||
          addon.available_for_plans.includes(userPlanSlug),
      );
    }

    return addons;
  }

  async findOne(id: number): Promise<Addon> {
    const addon = await this.addonRepository.findOne({
      where: { id },
    });

    if (!addon) {
      throw new NotFoundException(`Addon with ID ${id} not found`);
    }

    return addon;
  }

  async getUserAddons(userId: number): Promise<UserAddon[]> {
    return this.userAddonRepository.find({
      where: { userId, status: 'active' },
      relations: { addon: true },
      order: { created_at: 'DESC' },
    });
  }

  // NOTE: This method is a placeholder for purchase logic.
  // In a real scenario, this would involve payment processing via BillingService.
  async purchaseAddon(
    userId: number,
    dto: PurchaseAddonDto,
  ): Promise<UserAddon> {
    const addon = await this.findOne(dto.addonId);

    // Calculate next renewal date if monthly
    const now = new Date();
    let nextRenewal = null;

    if (addon.billing_cycle === 'monthly') {
      nextRenewal = new Date(now);
      nextRenewal.setMonth(nextRenewal.getMonth() + 1);
    }

    const userAddon = this.userAddonRepository.create({
      userId,
      addon,
      quantity_purchased: dto.quantity,
      status: 'active',
      purchased_at: now,
      next_renewal_date: nextRenewal,
    });

    return this.userAddonRepository.save(userAddon);
  }

  async cancelAddon(userId: number, userAddonId: number): Promise<void> {
    const userAddon = await this.userAddonRepository.findOne({
      where: { id: userAddonId, userId },
    });

    if (!userAddon) {
      throw new NotFoundException(`User addon not found`);
    }

    userAddon.status = 'cancelled';
    // Optionally set expires_at = next_renewal_date
    if (userAddon.next_renewal_date) {
      userAddon.expires_at = userAddon.next_renewal_date;
    } else {
      userAddon.expires_at = new Date();
    }

    await this.userAddonRepository.save(userAddon);
  }
}
