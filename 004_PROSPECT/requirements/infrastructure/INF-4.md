---
type: Infrastructure
id: INF-4
title: "Geocoding Service"
status: draft
version: "1.0"
date: "2025-07-14"
---

# INF-4: Geocoding Service

## Purpose

Address normalization and coordinate resolution for property locations and candidate preferences.

## Specification

- **Provider:** Google Maps Geocoding API (primary), OpenStreetMap Nominatim (fallback)
- **Caching:** Geocoded results cached in Redis (TTL 30 days)
- **Rate Limits:** 50 requests/second (Google), 1 request/second (OSM fallback)
- **Distance Calculation:** Haversine formula for radius filtering

## Integration Pattern

- Synchronous call during search creation and profile creation.
- Cache-first lookup to minimize API calls.
- Fallback to secondary provider on primary failure.

## Cost Control

- Cache hit target: > 80% (reduce API calls)
- Monthly budget alert at 80% threshold