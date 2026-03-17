---
type: user-story
id: US-4.1
status: draft
parent: SOL-4
version: "1.0"
---

# US-4.1: Optional Image Upload + Visual Compatibility

> **As a** verified user **I want to** optionally upload photos and use an AI-based visual compatibility assessment **so that** a visual impression can feed into matching alongside text-based criteria — if I choose to.

## Acceptance Criteria

- [ ] AC-4.1.1: Image upload is fully optional — no user is forced to upload.
- [ ] AC-4.1.2: Uploaded images are automatically checked for authenticity (deepfake detection, stock photo detection).
- [ ] AC-4.1.3: The AI computes a visual harmony score between two users.
- [ ] AC-4.1.4: The harmony score feeds into the overall score only when **both** users have actively opted in.
- [ ] AC-4.1.5: Users are clearly informed that an AI analyzes their images and can opt out at any time.
- [ ] AC-4.1.6: Images are fully removed on opt-out or account deletion.

## Components

- CMP-4.1.1: Image Upload & Analysis Module