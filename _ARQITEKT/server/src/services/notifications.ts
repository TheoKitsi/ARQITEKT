import { randomUUID } from 'crypto';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type NotificationType =
  | 'gate_failed'
  | 'gate_passed'
  | 'drift_detected'
  | 'feedback_received'
  | 'build_complete'
  | 'build_failed'
  | 'baseline_created'
  | 'validation_error'
  | 'info';

export type NotificationSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface Notification {
  id: string;
  projectId: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  read: boolean;
  artifactId?: string;
  createdAt: string;
}

export interface CreateNotificationInput {
  projectId: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  artifactId?: string;
}

/* ------------------------------------------------------------------ */
/*  In-memory store (per-project, capped at 200 per project)           */
/* ------------------------------------------------------------------ */

const MAX_PER_PROJECT = 200;
const store = new Map<string, Notification[]>();

/* ------------------------------------------------------------------ */
/*  WebSocket broadcast hook                                           */
/* ------------------------------------------------------------------ */

type BroadcastFn = (type: string, payload: unknown) => void;
let broadcastFn: BroadcastFn | null = null;

/** Called once from WebSocket setup to register the broadcast function. */
export function registerBroadcast(fn: BroadcastFn): void {
  broadcastFn = fn;
}

/* ------------------------------------------------------------------ */
/*  Service functions                                                  */
/* ------------------------------------------------------------------ */

export function createNotification(input: CreateNotificationInput): Notification {
  const notification: Notification = {
    id: randomUUID(),
    projectId: input.projectId,
    type: input.type,
    severity: input.severity,
    title: input.title,
    message: input.message,
    read: false,
    artifactId: input.artifactId,
    createdAt: new Date().toISOString(),
  };

  const list = store.get(input.projectId) ?? [];
  list.unshift(notification);
  // Cap the list
  if (list.length > MAX_PER_PROJECT) list.length = MAX_PER_PROJECT;
  store.set(input.projectId, list);

  // Push to connected clients
  if (broadcastFn) {
    broadcastFn('notification:new', notification);
  }

  return notification;
}

export function listNotifications(
  projectId: string,
  opts?: { unreadOnly?: boolean },
): Notification[] {
  const list = store.get(projectId) ?? [];
  if (opts?.unreadOnly) return list.filter((n) => !n.read);
  return list;
}

export function markRead(projectId: string, notificationId: string): boolean {
  const list = store.get(projectId);
  if (!list) return false;
  const item = list.find((n) => n.id === notificationId);
  if (!item) return false;
  item.read = true;
  return true;
}

export function markAllRead(projectId: string): number {
  const list = store.get(projectId);
  if (!list) return 0;
  let count = 0;
  for (const n of list) {
    if (!n.read) {
      n.read = true;
      count++;
    }
  }
  return count;
}

export function deleteNotification(projectId: string, notificationId: string): boolean {
  const list = store.get(projectId);
  if (!list) return false;
  const idx = list.findIndex((n) => n.id === notificationId);
  if (idx === -1) return false;
  list.splice(idx, 1);
  return true;
}

export function getUnreadCount(projectId: string): number {
  const list = store.get(projectId);
  if (!list) return 0;
  return list.filter((n) => !n.read).length;
}
