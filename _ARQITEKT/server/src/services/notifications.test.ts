import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createNotification,
  listNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  getUnreadCount,
  registerBroadcast,
} from './notifications.js';

describe('notifications service', () => {
  const projectId = 'test-project';

  // Clear store between tests by creating with unique project IDs
  // Since there's no clearAll export, each test uses a unique projectId
  let uniqueProjectId: string;
  beforeEach(() => {
    uniqueProjectId = `proj-${Date.now()}-${Math.random()}`;
  });

  describe('createNotification', () => {
    it('creates a notification with all fields', () => {
      const n = createNotification({
        projectId: uniqueProjectId,
        type: 'gate_passed',
        severity: 'medium',
        title: 'Gate G1 passed',
        message: 'All checks passed for G1',
      });

      expect(n.id).toBeDefined();
      expect(n.projectId).toBe(uniqueProjectId);
      expect(n.type).toBe('gate_passed');
      expect(n.severity).toBe('medium');
      expect(n.title).toBe('Gate G1 passed');
      expect(n.message).toBe('All checks passed for G1');
      expect(n.read).toBe(false);
      expect(n.createdAt).toBeDefined();
    });

    it('includes optional artifactId', () => {
      const n = createNotification({
        projectId: uniqueProjectId,
        type: 'validation_error',
        severity: 'high',
        title: 'Validation failed',
        message: 'V-003 violated',
        artifactId: 'SOL-001',
      });

      expect(n.artifactId).toBe('SOL-001');
    });

    it('calls broadcast when registered', () => {
      const broadcast = vi.fn();
      registerBroadcast(broadcast);

      const n = createNotification({
        projectId: uniqueProjectId,
        type: 'info',
        severity: 'info',
        title: 'Test',
        message: 'Test broadcast',
      });

      expect(broadcast).toHaveBeenCalledWith('notification:new', n);

      // Restore: prevent broadcast leak to other tests
      registerBroadcast(null as any);
    });
  });

  describe('listNotifications', () => {
    it('returns empty array for unknown project', () => {
      expect(listNotifications('nonexistent')).toEqual([]);
    });

    it('returns all notifications for a project', () => {
      createNotification({ projectId: uniqueProjectId, type: 'info', severity: 'low', title: 'A', message: 'a' });
      createNotification({ projectId: uniqueProjectId, type: 'info', severity: 'low', title: 'B', message: 'b' });

      const list = listNotifications(uniqueProjectId);
      expect(list).toHaveLength(2);
    });

    it('filters unread only', () => {
      const n1 = createNotification({ projectId: uniqueProjectId, type: 'info', severity: 'low', title: 'A', message: 'a' });
      createNotification({ projectId: uniqueProjectId, type: 'info', severity: 'low', title: 'B', message: 'b' });
      markRead(uniqueProjectId, n1.id);

      const unread = listNotifications(uniqueProjectId, { unreadOnly: true });
      expect(unread).toHaveLength(1);
      expect(unread[0]!.title).toBe('B');
    });
  });

  describe('markRead', () => {
    it('marks a notification as read', () => {
      const n = createNotification({ projectId: uniqueProjectId, type: 'info', severity: 'low', title: 'R', message: 'r' });
      expect(markRead(uniqueProjectId, n.id)).toBe(true);
      expect(listNotifications(uniqueProjectId)[0]!.read).toBe(true);
    });

    it('returns false for nonexistent project', () => {
      expect(markRead('nope', 'nope')).toBe(false);
    });

    it('returns false for nonexistent notification', () => {
      createNotification({ projectId: uniqueProjectId, type: 'info', severity: 'low', title: 'X', message: 'x' });
      expect(markRead(uniqueProjectId, 'bad-id')).toBe(false);
    });
  });

  describe('markAllRead', () => {
    it('marks all notifications as read', () => {
      createNotification({ projectId: uniqueProjectId, type: 'info', severity: 'low', title: 'A', message: 'a' });
      createNotification({ projectId: uniqueProjectId, type: 'info', severity: 'low', title: 'B', message: 'b' });

      const count = markAllRead(uniqueProjectId);
      expect(count).toBe(2);
      expect(getUnreadCount(uniqueProjectId)).toBe(0);
    });

    it('returns 0 for unknown project', () => {
      expect(markAllRead('nonexistent')).toBe(0);
    });
  });

  describe('deleteNotification', () => {
    it('removes a notification', () => {
      const n = createNotification({ projectId: uniqueProjectId, type: 'info', severity: 'low', title: 'D', message: 'd' });
      expect(deleteNotification(uniqueProjectId, n.id)).toBe(true);
      expect(listNotifications(uniqueProjectId)).toHaveLength(0);
    });

    it('returns false for nonexistent', () => {
      expect(deleteNotification('nope', 'nope')).toBe(false);
    });
  });

  describe('getUnreadCount', () => {
    it('counts unread notifications', () => {
      createNotification({ projectId: uniqueProjectId, type: 'info', severity: 'low', title: 'A', message: 'a' });
      createNotification({ projectId: uniqueProjectId, type: 'info', severity: 'low', title: 'B', message: 'b' });
      const n3 = createNotification({ projectId: uniqueProjectId, type: 'info', severity: 'low', title: 'C', message: 'c' });
      markRead(uniqueProjectId, n3.id);

      expect(getUnreadCount(uniqueProjectId)).toBe(2);
    });

    it('returns 0 for unknown project', () => {
      expect(getUnreadCount('nonexistent')).toBe(0);
    });
  });
});
