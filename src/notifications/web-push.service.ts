import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as webpush from 'web-push';

import { Notification, NotificationType } from './entities/notification.entity';
import { PushSubscription } from './entities/push-subscription.entity';

@Injectable()
export class WebPushService {
  private readonly logger = new Logger(WebPushService.name);

  constructor(
    @InjectRepository(PushSubscription)
    private pushSubscriptionRepository: Repository<PushSubscription>,
  ) {
    // Configure VAPID details
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@tijaratk.com';

    if (vapidPublicKey && vapidPrivateKey) {
      webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
      this.logger.log('Web Push VAPID details configured');
    } else {
      this.logger.warn('VAPID keys not configured. Push notifications will not work.');
    }
  }

  /**
   * Get the VAPID public key for client subscription
   */
  getVapidPublicKey(): string | undefined {
    return process.env.VAPID_PUBLIC_KEY;
  }

  /**
   * Send push notification to all subscribed devices for a user
   */
  async sendPushNotification(userId: number, notification: Notification): Promise<void> {
    const subscriptions = await this.pushSubscriptionRepository.find({
      where: { user: { id: userId } },
    });

    if (subscriptions.length === 0) {
      this.logger.debug(`No push subscriptions found for user ${userId}`);
      return;
    }

    const payload = JSON.stringify({
      title: this.getNotificationTitle(notification),
      body: notification.content,
      icon: '/android-chrome-192x192.png',
      badge: '/favicon-32x32.png',
      data: {
        type: notification.type,
        notificationId: notification.id,
        url: this.getNotificationUrl(notification),
      },
    });

    const sendPromises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload,
        );
        this.logger.debug(`Push notification sent to subscription ${sub.id}`);
      } catch (error: any) {
        // If subscription is expired or invalid, remove it
        if (error.statusCode === 404 || error.statusCode === 410) {
          this.logger.warn(`Removing invalid subscription: ${sub.id}`);
          await this.pushSubscriptionRepository.delete(sub.id);
        } else {
          this.logger.error(`Push notification failed for subscription ${sub.id}: ${error.message}`);
        }
      }
    });

    await Promise.allSettled(sendPromises);
  }

  /**
   * Generate notification title based on type
   */
  private getNotificationTitle(notification: Notification): string {
    switch (notification.type) {
      case NotificationType.MESSAGE:
        return `New message from ${notification.sender_name || 'Customer'}`;
      case NotificationType.COMMENT:
        return notification.productName
          ? `New comment on ${notification.productName}`
          : 'New comment on your product';
      case NotificationType.PRODUCT_ORDER:
        return 'New order received!';
      default:
        return 'Tijaratk Notification';
    }
  }

  /**
   * Get the URL to navigate to when notification is clicked
   */
  private getNotificationUrl(notification: Notification): string {
    switch (notification.type) {
      case NotificationType.PRODUCT_ORDER:
        return '/orders';
      case NotificationType.MESSAGE:
      case NotificationType.COMMENT:
      default:
        return '/notifications';
    }
  }

  /**
   * Subscribe a user to push notifications
   */
  async subscribe(
    userId: number,
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
    userAgent?: string,
  ): Promise<PushSubscription> {
    // Check if subscription already exists
    const existing = await this.pushSubscriptionRepository.findOne({
      where: { endpoint: subscription.endpoint },
    });

    if (existing) {
      existing.updated_at = new Date();
      return this.pushSubscriptionRepository.save(existing);
    }

    const newSubscription = this.pushSubscriptionRepository.create({
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      user_agent: userAgent,
      user: { id: userId },
    });

    return this.pushSubscriptionRepository.save(newSubscription);
  }

  /**
   * Unsubscribe a specific endpoint
   */
  async unsubscribe(endpoint: string): Promise<void> {
    await this.pushSubscriptionRepository.delete({ endpoint });
  }

  /**
   * Unsubscribe all devices for a user
   */
  async unsubscribeAll(userId: number): Promise<void> {
    await this.pushSubscriptionRepository.delete({ user: { id: userId } });
  }

  /**
   * Get subscription count for a user
   */
  async getSubscriptionCount(userId: number): Promise<number> {
    return this.pushSubscriptionRepository.count({
      where: { user: { id: userId } },
    });
  }
}
