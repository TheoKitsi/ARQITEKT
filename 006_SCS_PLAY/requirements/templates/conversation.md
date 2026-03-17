---
type: ConversationFlow
id: "CONV-{sol}.{us}.{cmp}.{fn}.{n}"
title: "{TITLE}"
status: draft
version: "1.0"
date: "{DATE}"
parent: "FN-{sol}.{us}.{cmp}.{fn}"
bot_type: "{assistant|support|onboarding}"
---

# CONV-{sol}.{us}.{cmp}.{fn}.{n}: {TITLE}

> **Parent**: [FN-{sol}.{us}.{cmp}.{fn}](../functions/FN-{sol}.{us}.{cmp}.{fn}_{parent_title}.md)
> **Bot Type**: {assistant | support | onboarding}

---

## Purpose

<!-- What does this conversation flow achieve? -->

---

## Intents

| Intent-ID | Intent | Example Utterances |
|---|---|---|
| INT-1 | {Intent name} | "{Example 1}", "{Example 2}" |
| INT-2 | {Intent name} | "{Example 1}", "{Example 2}" |

---

## Conversation Flow

```
[User] -> {Entry point}
    |
    +-- Intent recognized: {INT-1}
    |   +-- [Bot] -> {Response}
    |       +-- [User confirms] -> {Next step}
    |       +-- [User declines] -> {Alternative}
    |
    +-- Intent recognized: {INT-2}
    |   +-- [Bot] -> {Response}
    |
    +-- Intent not recognized
        +-- [Bot] -> Clarification / Escalation
```

---

## Responses

| Response-ID | Condition | Response |
|---|---|---|
| RSP-1 | {Condition} | "{Bot response}" |
| RSP-2 | {Condition} | "{Bot response}" |

---

## Escalation

| Trigger | Escalation Target | Behavior |
|---|---|---|
| {3x not understood} | {Human support} | {Create ticket, hand over chat} |
| {Sensitive data} | {Privacy team} | {Forward with context} |

---

## Context Data

<!-- What data does the bot need from the system? -->

| Data Source | Usage |
|---|---|
| {User profile} | {Personalization of responses} |

---

## Acceptance Criteria

- [ ] {Bot recognizes intent X in >90% of cases}
- [ ] {Escalation is triggered within {n} seconds}
- [ ] {Conversation can be aborted at any time}
