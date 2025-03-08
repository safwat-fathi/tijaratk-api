export interface WebhookEntry {
  messaging?: any[];
  changes?: any[];
}

export interface FormattedWebhookEvent {
  type: 'message' | 'comment';
  content: string;
  sender_id: string;
  recipient_id?: string;
  timestamp?: number;
  post_id?: string;
  comment_id?: string;
  page_id?: string;
  parent_comment_id?: string;
}
