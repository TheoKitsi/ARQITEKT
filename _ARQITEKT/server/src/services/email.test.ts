import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock config before importing email service
vi.mock('../config.js', () => ({
  config: {
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    smtpFrom: 'test@arqitekt.dev',
  },
}));

vi.mock('./logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));

import { sendEmail, sendGatePassedEmail, sendInviteEmail, sendStatusChangeEmail } from './email.js';
import { config } from '../config.js';

describe('email service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('returns false when SMTP is not configured', async () => {
      (config as any).smtpHost = '';
      const result = await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        text: 'Hello',
      });
      expect(result).toBe(false);
    });
  });

  describe('template functions', () => {
    it('sendGatePassedEmail returns false without SMTP', async () => {
      (config as any).smtpHost = '';
      const result = await sendGatePassedEmail('user@example.com', 'My Project', 'G1');
      expect(result).toBe(false);
    });

    it('sendInviteEmail returns false without SMTP', async () => {
      (config as any).smtpHost = '';
      const result = await sendInviteEmail('user@example.com', 'My Project', 'https://example.com/invite/abc');
      expect(result).toBe(false);
    });

    it('sendStatusChangeEmail returns false without SMTP', async () => {
      (config as any).smtpHost = '';
      const result = await sendStatusChangeEmail('user@example.com', 'My Project', 'SOL-001', 'review');
      expect(result).toBe(false);
    });
  });
});
