import { NotificationType } from 'src/notifications/entities/notification.entity';

export interface WebhookEntry {
  messaging?: any[];
  changes?: any[];
}

export type CommentVerb = 'add' | 'edit' | 'delete';

type FormattedWebhookEvent = {
  content: string;
  sender_id: string;
  timestamp: number;
  page_id: string;
};

export type FormattedWebhookMessageEvent = FormattedWebhookEvent & {
  type: NotificationType.MESSAGE;
  message_id: string;
};

export type FormattedWebhookCommentEvent = FormattedWebhookEvent & {
  type: NotificationType.COMMENT;
  sender_name: string;
  // Post-related fields
  post: {
    id: string;
    status_type?: string;
    is_published?: boolean;
    updated_time?: string;
    permalink_url?: string;
    promotion_status?: string;
  };
  post_id: string;
  verb?: CommentVerb;
  comment_id?: string;
  parent_id?: string;
};

export type FormattedWebhookEvents =
  | FormattedWebhookMessageEvent
  | FormattedWebhookCommentEvent;
