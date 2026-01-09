import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Merchant, MerchantOnboardingStatus } from './entities/merchant.entity';

/**
 * Service for managing merchant profiles.
 *
 * Note: Merchant is a profile table linked to User via user_id.
 * User lookup by phone/email happens in auth service, not here.
 */
@Injectable()
export class MerchantsService {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
  ) {}

  // ==================== Standard CRUD Methods ====================

  /**
   * Find a merchant profile by user ID
   */
  async findByUserId(userId: number): Promise<Merchant | null> {
    return this.merchantRepository.findOne({
      where: { user_id: userId },
      relations: ['user', 'primary_store'],
    });
  }

  /**
   * Check if a user has a merchant profile
   */
  async hasMerchantProfile(userId: number): Promise<boolean> {
    const count = await this.merchantRepository.count({
      where: { user_id: userId },
    });
    return count > 0;
  }

  /**
   * Create a merchant profile for a user
   */
  async createForUser(
    userId: number,
    data?: Partial<Omit<Merchant, 'user_id' | 'user'>>,
  ): Promise<Merchant> {
    const merchant = this.merchantRepository.create({
      user_id: userId,
      ...data,
    });
    return this.merchantRepository.save(merchant);
  }

  /**
   * Update an existing merchant profile
   */
  async update(
    userId: number,
    data: Partial<Omit<Merchant, 'user_id' | 'user'>>,
  ): Promise<Merchant> {
    const merchant = await this.findByUserId(userId);
    if (!merchant) {
      throw new NotFoundException(
        `Merchant profile for user ${userId} not found`,
      );
    }
    Object.assign(merchant, data);
    return this.merchantRepository.save(merchant);
  }

  // ==================== Onboarding Methods ====================

  /**
   * Update merchant onboarding status
   */
  async updateOnboardingStatus(
    userId: number,
    status: MerchantOnboardingStatus,
  ): Promise<Merchant> {
    const merchant = await this.findByUserId(userId);
    if (!merchant) {
      throw new NotFoundException(
        `Merchant profile for user ${userId} not found`,
      );
    }
    merchant.onboarding_status = status;
    return this.merchantRepository.save(merchant);
  }

  /**
   * Get current onboarding status for a merchant
   */
  async getOnboardingStatus(userId: number): Promise<MerchantOnboardingStatus> {
    const merchant = await this.merchantRepository.findOne({
      where: { user_id: userId },
      select: ['user_id', 'onboarding_status'],
    });
    if (!merchant) {
      throw new NotFoundException(
        `Merchant profile for user ${userId} not found`,
      );
    }
    return merchant.onboarding_status;
  }

  /**
   * Set primary store for a merchant
   */
  async setPrimaryStore(userId: number, storeId: number): Promise<Merchant> {
    const merchant = await this.findByUserId(userId);
    if (!merchant) {
      throw new NotFoundException(
        `Merchant profile for user ${userId} not found`,
      );
    }
    merchant.primary_store_id = storeId;
    return this.merchantRepository.save(merchant);
  }

  // ==================== Soft Delete Methods ====================

  /**
   * Soft delete a merchant profile (sets deleted_at timestamp)
   */
  async softDelete(userId: number): Promise<void> {
    const merchant = await this.findByUserId(userId);
    if (!merchant) {
      throw new NotFoundException(
        `Merchant profile for user ${userId} not found`,
      );
    }
    await this.merchantRepository.softDelete({ user_id: userId });
  }

  /**
   * Restore a soft-deleted merchant profile
   */
  async restore(userId: number): Promise<Merchant> {
    await this.merchantRepository.restore({ user_id: userId });
    const merchant = await this.findByUserId(userId);
    if (!merchant) {
      throw new NotFoundException(
        `Merchant profile for user ${userId} not found`,
      );
    }
    return merchant;
  }
}
