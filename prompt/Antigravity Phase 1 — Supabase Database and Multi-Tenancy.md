# PHASE 1 — SUPABASE DATABASE + MULTI-TENANCY

Now implement the complete production-grade tenant foundation.

The uploaded FRD is the source of truth.

## Database architecture

Create migrations for:

businesses
business_members
customers
services

Also create foundational audit/timestamp structures where appropriate.

Every tenant-owned table must include:

business_id UUID NOT NULL

## Business

Create:

businesses

Fields should support the FRD's onboarding requirements:

- id
- business name
- owner information
- mobile
- WhatsApp
- email
- address
- logo
- business type
- created_at
- updated_at

## Business membership

Create:

business_members

Support:

OWNER
ACCOUNTANT
STAFF

Design for one user belonging to multiple businesses.

## Customers

Support:

REGULAR
WALK_IN

Implement the FRD rules around:

- optional walk-in customer
- name/mobile optional for fully paid walk-in
- name/mobile required when balance is due
- mobile duplicate warning
- possible duplicate status

Do not hard-block duplicate mobile numbers.

## Services

Support:

- fixed
- custom
- hourly
- quantity based

Fields:

name
default rate
category
pricing mode
active/inactive
business_id
timestamps

## RLS

This phase MUST implement real RLS.

Policies must ensure:

User can access only businesses where they are a member.

User can access only records belonging to their authorized businesses.

Test:

Business A cannot access Business B.

Test SELECT.

Test INSERT.

Test UPDATE.

Test DELETE.

Test direct requests.

## Indexes

Add appropriate indexes for:

business_id
customer mobile
customer name
service name
created_at

Do not add unnecessary indexes.

## Constraints

Use PostgreSQL constraints for:

required fields
valid values
positive/appropriate numeric amounts
foreign keys
unique constraints where logically appropriate

## Type generation

Generate TypeScript database types.

## Seed data

Create safe development seed data.

Never seed fake production users or passwords.

## Tests

Write tests for:

tenant isolation
customer access
business membership
role access
duplicate customer warning logic

## Verification

Run:

lint
typecheck
tests
build

Inspect all migrations.

Confirm the database can be rebuilt from migrations.

## STOP

Do not implement billing yet.

Provide phase report and STOP.