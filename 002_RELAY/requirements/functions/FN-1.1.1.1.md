---
type: Function
id: FN-1.1.1.1
title: "Process Approval Document Upload"
status: draft
version: "1.0"
date: "2025-07-14"
parent: CMP-1.1.1
---

# FN-1.1.1.1: Process Approval Document Upload

## Functional Description

- The system shall accept a document upload from the listing tenant via the Listing Management API.
- The system shall validate that the document format is PDF, PNG, or JPG and that the file size does not exceed 10 MB.
- The system shall store the validated document in S3-compatible storage with a unique reference key linked to the listing.
- The system shall record the approval event (timestamp, method: "upload", document reference, tenant identity) in the approval record.
- The system shall transition the listing's approval status from "pending" to "document-uploaded".
- The system shall emit an audit event for the document upload.

## Preconditions

- The listing exists in "draft" state.
- The tenant is authenticated and is the owner of the listing.
- No prior approval (upload or in-app) is already on file.

## Behavior

1. Tenant submits a file via the upload endpoint.
2. System validates format and size; rejects with specific error if invalid.
3. System stores the file and generates a reference key.
4. System creates the approval record and updates listing approval status.
5. System emits audit event.
6. System returns success with approval record ID.

## Postconditions

- The document is stored and retrievable by reference key.
- The listing's approval status is "document-uploaded".
- An audit entry exists for the upload event.

## Error Handling

- The system shall return HTTP 415 (Unsupported Media Type) if the document format is not PDF, PNG, or JPG.
- The system shall return HTTP 413 (Payload Too Large) if the file exceeds 10 MB.
- The system shall return HTTP 409 (Conflict) if an approval is already on file.
- The system shall return HTTP 403 (Forbidden) if the authenticated user is not the listing owner.
- The system shall roll back the storage upload if the approval record creation fails.