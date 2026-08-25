# PHASE 7 — USERS + PERMISSIONS + AUDIT

Now make the application suitable for real businesses with multiple employees.

## Roles

OWNER
ACCOUNTANT
STAFF

## Permissions

Support:

VIEW
CREATE
EDIT
DELETE
PRINT
EXPORT
WHATSAPP

Permission matrix must be configurable by Owner.

## Rules

Owner:

full access by default.

Accountant:

financial/reporting access according to FRD.

Staff:

operational access according to FRD.

Do not rely on hiding buttons.

Server-side authorization is mandatory.

RLS must reinforce tenant isolation.

## User management

Owner can:

invite user
remove user
change role
manage permissions

Prepare architecture for invitation emails.

## Audit logs

Create:

audit_logs

Track important:

create
edit
delete
cancel
credit note
payment
receipt
expense
loan
permission changes

Store:

business_id
user_id
action
entity_type
entity_id
timestamp
metadata where safe

Never store secrets.

## Tests

Attempt unauthorized operations directly.

Every forbidden operation must fail server-side.

## STOP

Provide phase report and STOP.