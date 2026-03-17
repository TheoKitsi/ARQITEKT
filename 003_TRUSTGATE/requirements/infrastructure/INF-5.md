---
type: Infrastructure
id: INF-5
title: "OCR Service"
status: draft
version: "1.0"
date: "2025-07-14"
---

# INF-5: OCR Service

## Purpose

Document extraction service for income verification — parses uploaded payslips, tax returns, and bank statements into structured data fields.

## Specification

| Property | Value |
|---|---|
| Engine | Cloud OCR (AWS Textract / Azure Document Intelligence) or self-hosted (Tesseract + custom models) |
| Input | PDF, PNG, JPG |
| Output | Structured JSON (fields: employer, gross, net, period, currency) |
| Accuracy Target | > 95% field extraction accuracy for standard German payslips |
| Fallback | Manual review queue for extraction confidence < 80% |

## Data Flow

1. Income Engine sends document reference to OCR Service.
2. OCR Service fetches document from INF-3.
3. OCR Service extracts fields and returns structured JSON.
4. Income Engine runs plausibility checks on extracted data.