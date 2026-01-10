import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationSortBy, SortOrder } from 'src/common/enums/sort.enums';
import { User } from 'src/users/entities/user.entity';
import { FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';

import { ListNotificationsDto } from './dto/list-notifications.dto';
import { Notification } from './entities/notification.entity';
import { WebPushService } from './web-push.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @Inject(forwardRef(() => WebPushService))
    private readonly webPushService: WebPushService,
  ) {}

  /**
   * Retrieves a paginated list of notifications for a specific user.
   * @param userId - The user ID.
   * @param listNotificationsDto - Pagination and filter options.
   * @returns Object containing notifications data and total count.
   */
  async getUserNotifications(
    userId: number,
    listNotificationsDto: ListNotificationsDto,
  ): Promise<{ data: Notification[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sort_by = NotificationSortBy.CREATED_AT,
      sort_order = SortOrder.DESC,
    } = listNotificationsDto;

    const orderOptions: FindOptionsOrder<Notification> = {};
    if (sort_by === NotificationSortBy.CREATED_AT) {
      orderOptions.created_at = sort_order;
    }

    const whereOptions: FindOptionsWhere<Notification> = {
      user: { id: userId },
    };

    const [data, total] = await this.notificationRepository.findAndCount({
      where: whereOptions,
      order: orderOptions,
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  /**
   * Marks a specific notification as read.
   * @param notificationId - The ID of the notification to update.
   * @returns The updated notification entity.
   */
  async markNotificationAsRead(notificationId: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.is_read = true;
    return await this.notificationRepository.save(notification);
  }

  /**
   * Marks a specific notification as unread.
   * @param notificationId - The ID of the notification to update.
   * @returns The updated notification entity.
   */
  async markNotificationAsUnRead(
    notificationId: number,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    notification.is_read = false;
    return await this.notificationRepository.save(notification);
  }

  /**
   * Creates a new notification for a user.
   * @param user - The user to receive the notification.
   * @param data - The notification data.
   * @returns The newly created notification.
   */
  async createNotification(
    user: User,
    data: Partial<Notification>,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      ...data,
      user,
      is_read: false,
    });
    const saved = await this.notificationRepository.save(notification);

    // Send push notification to all subscribed devices
    try {
      await this.webPushService.sendPushNotification(user.id, saved);
    } catch (error) {
      // Don't fail the notification creation if push fails
      this.logger.error('Failed to send push notification:', error);
    }

    return saved;
  }

  /**
   * Deletes a notification by its ID.
   * @param notificationId - The ID of the notification to delete.
   */
  async deleteNotification(notificationId: number): Promise<void> {
    const result = await this.notificationRepository.delete(notificationId);
    if (result.affected === 0) {
      throw new NotFoundException('Notification not found');
    }
  }

  /**
   * Marks all notifications for a user as read.
   * @param userId - The user ID.
   * @param type - Optional notification type to filter by.
   */
  async markAllAsRead(userId: number, type?: string): Promise<void> {
    const query = this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ is_read: true })
      .where('"userId" = :userId', { userId });

    if (type) {
      query.andWhere('type = :type', { type });
    }

    await query.execute();
  }

  /**
   * Returns the count of unread notifications for a specific user.
   * @param userId - The user ID.
   * @returns A promise resolving to the number of unread notifications.
   */
  async countUnreadNotifications(userId: number): Promise<number> {
    return await this.notificationRepository.count({
      where: {
        user: { id: userId },
        is_read: false,
      },
    });
  }

  /**
   * Clear all notifications for a user.
   * @param userId - The user ID.
   */
  async clearNotifications(userId: number): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder('notification')
      .delete()
      .where('"userId" = :userId', { userId })
      .execute();
  }
}
