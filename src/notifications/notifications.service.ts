import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  /**
   * Retrieves a paginated list of notifications for a specific user.
   * @param userId - The ID of the user.
   * @param page - The current page number (default is 1).
   * @param limit - Number of notifications per page (default is 10).
   * @returns Object containing notifications data and total count.
   */
  async getUserNotifications(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Notification[]; total: number }> {
    const [data, total] = await this.notificationRepository.findAndCount({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
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
    return this.notificationRepository.save(notification);
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
    return this.notificationRepository.save(notification);
  }

  // Additional utility methods you might consider:

  /**
   * Creates a new notification for a user.
   * @param user - The user to receive the notification.
   * @param content - The notification content.
   * @returns The newly created notification.
   */
  async createNotification(user: User, content: string): Promise<Notification> {
    const notification = this.notificationRepository.create({
      user,
      content,
      is_read: false,
    });
    return this.notificationRepository.save(notification);
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
   * @param userId - The ID of the user.
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ is_read: true })
      .where('userId = :userId', { userId })
      .execute();
  }

  /**
   * Returns the count of unread notifications for a specific user.
   * @param userId - The ID of the user.
   * @returns A promise resolving to the number of unread notifications.
   */
  async countUnreadNotifications(userId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: {
        user: { id: userId },
        is_read: false,
      },
    });
  }
}
