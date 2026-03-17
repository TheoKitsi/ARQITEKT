---
type: component
id: CMP-4.1.1
status: draft
parent: US-4.1
version: "1.0"
---

# CMP-4.1.1: Image Upload & Analysis Module

## Functions

| FN-ID | Function |
|---|---|
| **FN-4.1.1.1** | The system shall provide an optional image upload (min. 1, max. 6 images) without requiring images for profile creation or matching. |
| **FN-4.1.1.2** | The system shall automatically check uploaded images for authenticity: deepfake detection, stock photo matching, and manipulation detection; on suspicion, the image is rejected and the user informed. |
| **FN-4.1.1.3** | The system shall compute an AI-based visual harmony score between two profiles, provided both users have uploaded images and granted opt-in. |
| **FN-4.1.1.4** | The system shall incorporate the visual harmony score only as an optional factor in the overall score — exclusively when both participating users have given active opt-in. |
| **FN-4.1.1.5** | The system shall transparently inform the user about the AI image analysis and allow opt-out at any time; on opt-out or account deletion, all images are fully deleted. |

## Function Files

- FN-4.1.1.1: Optional Image Upload
- FN-4.1.1.2: Image Authenticity Check
- FN-4.1.1.3: Visual Harmony Score
- FN-4.1.1.4: Optional Score Integration
- FN-4.1.1.5: Transparent AI Info & Opt-Out