---
name: Conversations Skill
description: Knowledge for creating and evaluating conversation requirements. Used by @architect and @review.
---

# Conversations — Skill Reference

## Purpose

A Conversation (CONV) defines a **user interaction flow** — typically a dialog, wizard, or multi-step form. It documents intents, flow, responses, and escalation paths.

## Template

-> `requirements/templates/conversation.md`

## Mandatory Sections

### 1. Purpose (required)

What user goal does this conversation serve?

### 2. Intents (required)

Which user intents (actions/goals) does the conversation handle?

### 3. Flow (required)

Step-by-step description of the conversation path, including branching logic.

### 4. Responses (required)

System responses per step, with tone and content guidelines.

### 5. Escalation (required)

When and how does the conversation escalate to a human or different system?

### 6. Context Data (optional)

What data does the conversation need and produce?

## Quality Criteria

- [ ] **Clear purpose** — One conversation = one user goal
- [ ] **Intents enumerated** — Every user intent handled
- [ ] **Flow documented** — Step-by-step with decision points
- [ ] **Success AND failure paths** — What happens when flow breaks?
- [ ] **Escalation defined** — No dead ends

## Conversation Design Patterns

| Pattern | When | Example |
|---|---|---|
| Linear | Fixed steps | Onboarding wizard |
| Branching | Decisions in flow | Support triage |
| Loop | Repeat until done | Item selection |
| Confirmation | Critical action | Delete account |
| Escalation | Human needed | Complex complaint |

## Anti-Patterns

- Monologue: System talks, user listens — a conversation has two sides
- Dead end: Flow with no exit — every path needs an ending
- No escalation: Users cannot reach a human — bad UX
- Too many steps: 10+ steps — users drop off. Simplify.
