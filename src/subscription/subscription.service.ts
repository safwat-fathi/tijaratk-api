import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Events } from 'src/common/enums/events.enum';
import { UserLoginEvent } from 'src/events/user-login.event';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Subscription } from './entities/subscription.entity';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Retrieve all subscriptions
  async findAll(): Promise<Subscription[]> {
    return await this.subscriptionRepository.find();
  }

  // Retrieve a single subscription by its ID
  async findOne(id: number): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
    });
    if (!subscription) {
      throw new NotFoundException(`Subscription with id ${id} not found`);
    }
    return subscription;
  }

  // Create a new subscription plan
  async create(
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    const subscription = this.subscriptionRepository.create(
      createSubscriptionDto,
    );
    return await this.subscriptionRepository.save(subscription);
  }

  // Update an existing subscription plan
  async update(
    id: number,
    updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<Subscription> {
    const subscription = await this.findOne(id);
    Object.assign(subscription, updateSubscriptionDto);
    return await this.subscriptionRepository.save(subscription);
  }

  // Remove a subscription plan
  async remove(id: number): Promise<void> {
    const subscription = await this.findOne(id);
    await this.subscriptionRepository.remove(subscription);
  }

  @OnEvent(Events.USER_LOGGED_IN)
  async handleUserLoginEvent(payload: UserLoginEvent) {
    this.logger.debug(
      `Received user.logged_in event for userId=${payload.userId}`,
    );

    // This service is deprecated - the old Subscription entity no longer has a users relation
    // New billing system uses UserSubscription entity instead
    // Returning null for backward compatibility
    return null;
  }
}
