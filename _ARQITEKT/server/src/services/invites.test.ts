import { describe, it, expect, vi, beforeEach } from 'vitest';
import { promises as fs } from 'fs';

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

vi.mock('fs', async () => {
  const fsp = {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
  };
  return { promises: fsp, default: { promises: fsp } };
});

vi.mock('../config.js', () => ({
  config: { hubRoot: '/mock-hub' },
}));

const mockUpdateRegistryEntry = vi.fn();
const mockGetRegistry = vi.fn();

vi.mock('./projects.js', () => ({
  getRegistry: () => mockGetRegistry(),
  updateRegistryEntry: (...args: any[]) => mockUpdateRegistryEntry(...args),
}));

import { createInvite, acceptInvite, listInvites, revokeInvite } from './invites.js';

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe('invites service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fs.readFile as any).mockRejectedValue(new Error('ENOENT'));
    (fs.writeFile as any).mockResolvedValue(undefined);
    (fs.mkdir as any).mockResolvedValue(undefined);
  });

  describe('createInvite', () => {
    it('creates an invite with valid token', async () => {
      const invite = await createInvite('p1', 'editor', 'alice');

      expect(invite.token).toHaveLength(48); // 24 bytes hex
      expect(invite.projectId).toBe('p1');
      expect(invite.role).toBe('editor');
      expect(invite.createdBy).toBe('alice');
      expect(new Date(invite.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });

    it('saves invite to file', async () => {
      await createInvite('p1', 'viewer', 'bob');

      expect(fs.writeFile).toHaveBeenCalledTimes(1);
      const written = JSON.parse((fs.writeFile as any).mock.calls[0][1]);
      expect(written).toHaveLength(1);
      expect(written[0].projectId).toBe('p1');
    });
  });

  describe('acceptInvite', () => {
    it('adds user to project members', async () => {
      const invite = await createInvite('p1', 'editor', 'alice');

      // Set up readFile to return the saved invite
      (fs.readFile as any).mockResolvedValue(JSON.stringify([invite]));
      mockGetRegistry.mockResolvedValue([
        { id: 'p1', name: 'Test', codename: 'test', mode: 'local', path: '/test' },
      ]);
      mockUpdateRegistryEntry.mockResolvedValue({});

      const result = await acceptInvite(invite.token, 'u2', 'carol');

      expect(result.projectId).toBe('p1');
      expect(result.role).toBe('editor');
      expect(mockUpdateRegistryEntry).toHaveBeenCalledWith('p1', {
        members: [expect.objectContaining({ userId: 'u2', username: 'carol', role: 'editor' })],
      });
    });

    it('throws on invalid token', async () => {
      (fs.readFile as any).mockResolvedValue('[]');

      await expect(acceptInvite('bad-token', 'u1', 'alice'))
        .rejects.toThrow('Invalid invite token');
    });

    it('throws on expired token', async () => {
      const expired = {
        token: 'expired-token',
        projectId: 'p1',
        role: 'viewer',
        createdBy: 'alice',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        expiresAt: new Date(Date.now() - 1000).toISOString(),
      };
      (fs.readFile as any).mockResolvedValue(JSON.stringify([expired]));

      await expect(acceptInvite('expired-token', 'u1', 'alice'))
        .rejects.toThrow('expired');
    });
  });

  describe('listInvites', () => {
    it('returns only non-expired invites for a project', async () => {
      const valid = {
        token: 'valid', projectId: 'p1', role: 'editor', createdBy: 'alice',
        createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString(),
      };
      const expired = {
        token: 'expired', projectId: 'p1', role: 'viewer', createdBy: 'alice',
        createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() - 1000).toISOString(),
      };
      const other = {
        token: 'other', projectId: 'p2', role: 'viewer', createdBy: 'bob',
        createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString(),
      };
      (fs.readFile as any).mockResolvedValue(JSON.stringify([valid, expired, other]));

      const result = await listInvites('p1');
      expect(result).toHaveLength(1);
      expect(result[0].token).toBe('valid');
    });
  });

  describe('revokeInvite', () => {
    it('removes an invite and returns true', async () => {
      const invite = { token: 'abc', projectId: 'p1', role: 'editor', createdBy: 'a', createdAt: '', expiresAt: '' };
      (fs.readFile as any).mockResolvedValue(JSON.stringify([invite]));

      const result = await revokeInvite('abc');
      expect(result).toBe(true);

      const written = JSON.parse((fs.writeFile as any).mock.calls[0][1]);
      expect(written).toHaveLength(0);
    });

    it('returns false for non-existent token', async () => {
      (fs.readFile as any).mockResolvedValue('[]');
      const result = await revokeInvite('nonexistent');
      expect(result).toBe(false);
    });
  });
});
