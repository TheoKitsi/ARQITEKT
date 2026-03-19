import { Router, type NextFunction, type Request, type Response } from 'express';
import {
  listNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  getUnreadCount,
} from '../services/notifications.js';

export const notificationsRouter = Router();

// GET /api/projects/:id/notifications
notificationsRouter.get('/:id/notifications', (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;
    const unreadOnly = req.query.unreadOnly === 'true';
    const items = listNotifications(projectId, { unreadOnly });
    const unread = getUnreadCount(projectId);
    res.json({ items, total: items.length, unread });
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id/notifications/unread-count
notificationsRouter.get('/:id/notifications/unread-count', (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id as string;
    const unread = getUnreadCount(projectId);
    res.json({ unread });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/projects/:id/notifications/:nid/read
notificationsRouter.patch('/:id/notifications/:nid/read', (req: Request, res: Response, next: NextFunction) => {
  try {
    const found = markRead(req.params.id as string, req.params.nid as string);
    if (!found) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/notifications/mark-all-read
notificationsRouter.post('/:id/notifications/mark-all-read', (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = markAllRead(req.params.id as string);
    res.json({ success: true, marked: count });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/projects/:id/notifications/:nid
notificationsRouter.delete('/:id/notifications/:nid', (req: Request, res: Response, next: NextFunction) => {
  try {
    const found = deleteNotification(req.params.id as string, req.params.nid as string);
    if (!found) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
