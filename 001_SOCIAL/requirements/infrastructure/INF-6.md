---
type: Infrastructure
id: INF-6
title: "AI/ML Matching Service"
status: draft
version: "1.0"
date: "2025-07-14"
---

# INF-6: AI/ML Matching Service

## Purpose
Hosts the intelligent text-based matching algorithm (SOL-3) and visual harmony
matching (SOL-4) as dedicated microservices with GPU-accelerated inference.

## Specification
| Property | Value |
|---|---|
| Runtime | Python 3.12+, FastAPI |
| ML Framework | PyTorch for visual harmony, scikit-learn for text matching |
| Hosting | GPU-enabled container (AWS SageMaker or dedicated ECS with GPU) |
| Model Storage | S3 bucket with versioned model artifacts |
| API | REST + gRPC for internal service-to-service calls |

## Service Components
- **Text Matcher**: NLP-based embeddings of funnel profile answers, cosine similarity scoring with weighted dimensions per funnel level.
- **Visual Harmony**: CNN-based feature extraction for compatibility prediction from user-consented photos.
- **Score Aggregator**: Combines text + visual scores with configurable weights, outputs final matching score.

## Data Flow
- Batch scoring: nightly re-computation of match scores for active users.
- Real-time scoring: on-demand computation when users update funnel profiles.
- Model retraining: scheduled monthly with feedback loop data (SOL-15).

## Scaling
- Horizontal scaling of inference pods behind load balancer.
- Model versioning with A/B testing support.
- Cold start mitigation via warm instance pool.
