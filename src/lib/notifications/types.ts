export type NotificationType = "system" | "properties" | "search";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: number;
  read: boolean;
}
