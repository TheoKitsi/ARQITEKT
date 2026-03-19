import { config } from '../config.js';
import { createLogger } from './logger.js';

const log = createLogger('email');

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/* ------------------------------------------------------------------ */
/*  Send email via SMTP (nodemailer — optional dependency)             */
/* ------------------------------------------------------------------ */

let transporterPromise: Promise<any> | null = null;

async function getTransporter(): Promise<any> {
  if (!config.smtpHost) return null;

  if (!transporterPromise) {
    transporterPromise = (async () => {
      // Dynamic import so the app works without nodemailer installed
      const moduleName = 'nodemailer';
      const nodemailer = await import(moduleName);
      return nodemailer.default.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpPort === 465,
        auth: config.smtpUser
          ? { user: config.smtpUser, pass: config.smtpPass }
          : undefined,
      });
    })();
  }

  return transporterPromise;
}

/**
 * Send an email. Returns true on success.
 * No-ops silently when SMTP is not configured or nodemailer is not installed.
 */
export async function sendEmail(opts: EmailOptions): Promise<boolean> {
  try {
    const transporter = await getTransporter();
    if (!transporter) {
      log.debug({ to: opts.to, subject: opts.subject }, 'Email skipped (SMTP not configured)');
      return false;
    }

    await transporter.sendMail({
      from: config.smtpFrom,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    });

    log.info({ to: opts.to, subject: opts.subject }, 'Email sent');
    return true;
  } catch (err) {
    log.error({ err, to: opts.to }, 'Failed to send email');
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  Pre-built notification templates                                   */
/* ------------------------------------------------------------------ */

export async function sendGatePassedEmail(to: string, project: string, gate: string): Promise<boolean> {
  return sendEmail({
    to,
    subject: `[ARQITEKT] Gate ${gate} passed — ${project}`,
    text: `Gate "${gate}" has passed for project "${project}".`,
    html: `<p>Gate <strong>${gate}</strong> has passed for project <strong>${project}</strong>.</p>`,
  });
}

export async function sendInviteEmail(to: string, project: string, inviteUrl: string): Promise<boolean> {
  return sendEmail({
    to,
    subject: `[ARQITEKT] You've been invited to ${project}`,
    text: `You've been invited to collaborate on "${project}". Accept here: ${inviteUrl}`,
    html: `<p>You've been invited to collaborate on <strong>${project}</strong>.</p><p><a href="${inviteUrl}">Accept Invitation</a></p>`,
  });
}

export async function sendStatusChangeEmail(to: string, project: string, artifactId: string, newStatus: string): Promise<boolean> {
  return sendEmail({
    to,
    subject: `[ARQITEKT] ${artifactId} status changed to ${newStatus}`,
    text: `Artifact "${artifactId}" in project "${project}" has been moved to status "${newStatus}".`,
    html: `<p>Artifact <strong>${artifactId}</strong> in project <strong>${project}</strong> has been moved to status <strong>${newStatus}</strong>.</p>`,
  });
}
