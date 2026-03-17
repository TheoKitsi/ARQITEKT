---
type: Infrastructure
id: INF-4
title: "Mobile SDK Integration"
status: draft
version: "1.0"
date: "2025-07-14"
---

# INF-4: Mobile SDK Integration

## Purpose

Native mobile SDK layer for eID/NFC verification flow integration on iOS and Android devices.

## Specification

| Property | Value |
|---|---|
| eID SDK | AusweisApp2 SDK (official German government SDK) |
| Platforms | iOS 16+, Android 10+ (with NFC) |
| Distribution | NPM package (React Native wrapper) or native pods/AARs |
| NFC Detection | Hardware capability check before flow initiation |

## Integration Pattern

- SDK provides callback-based API for flow events (started, PIN entered, reading, success, failure).
- Backend receives only extracted attributes; raw chip data never leaves the device.
- Resumption state managed via encrypted Redis key (INF-2).