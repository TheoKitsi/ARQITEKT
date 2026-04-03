---
name: Notifications Skill
description: Knowledge for creating and evaluating notification requirements. Used by @architect and @review.
---

# Notifications — Skill Reference

## Purpose

A Notification (NTF) defines a **system-initiated message** to the user across one or more channels. It documents trigger conditions, content per channel, user preferences, and i18n.

## Template

-> `requirements/templates/notification.md`

## Mandatory Sections

### 1. Channel Configuration (required)

Which channels does this notification use? (Push, Email, SMS, In-App, Webhook)

### 2. Trigger (required)

What system event triggers this notification? Under which conditions?

### 3. Content per Channel (required)

For each channel: subject, body template, variables, character limits.

### 4. User Preferences (required)

Can the user disable or configure this notification? Defaults?

### 5. i18n (required)

Which languages are supported? Fallback language?

## Quality Criteria

- [ ] **Trigger clearly defined** — Which event, which conditions?
- [ ] **Content per channel** — Not just "send email" but exact template
- [ ] **Variables documented** — {user_name}, {link}, etc.
- [ ] **User can opt out** — Or explicit justification why not (e.g. security)
- [ ] **Fallback** — What happens when channel fails?

## Channel Decision Matrix

| Channel | Urgency | Length | Interaction |
|---|---|---|---|
| Push | High | Short (< 100 chars) | Tap to open |
| Email | Medium | Long (formatted) | Links, attachments |
| SMS | Critical | Very short (< 160 chars) | Phone number required |
| In-App | Low | Variable | Shown on next visit |
| Webhook | System | JSON payload | Programmatic |

## Anti-Patterns

- Spam: Every event = notification — users disable all notifications
- No opt-out: User cannot control frequency — GDPR problem
- No template: "We just send an email" — template with variables is required
- Missing channel: Only email — what about mobile users?
