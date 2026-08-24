# PHASE 0 — PRODUCTION FOUNDATION

Do not build business modules yet.

First establish the production-grade foundation.

## Goals

Create the project using the technology stack defined in the master instruction.

Before installation:

1. Verify currently supported LTS Node.js version.
2. Verify compatible stable Next.js version.
3. Verify compatible React version.
4. Verify compatible TypeScript version.
5. Verify compatible Tailwind CSS version.
6. Verify compatible Supabase packages.
7. Lock exact versions.

Create the version matrix in:

docs/TECH_STACK.md

Document:

- Node.js
- Next.js
- React
- TypeScript
- Tailwind
- Supabase
- Zod
- React Hook Form
- testing libraries
- linting tools

## Create

- Next.js App Router project
- TypeScript strict mode
- Tailwind CSS
- shadcn/ui
- ESLint
- Prettier if appropriate
- Supabase integration
- environment configuration
- .env.example
- Git configuration
- README
- docs folder

## Folder architecture

Create a clean scalable structure:

app/
components/
lib/
services/
schemas/
types/
hooks/
supabase/
public/
tests/
docs/

Do not over-engineer.

## Supabase

Connect the project to Supabase.

Create the initial migration structure.

Do NOT create the complete business schema yet.

Create only the foundational structure needed for authentication and tenant architecture.

## Authentication foundation

Implement:

- login page
- registration page
- logout
- password reset
- protected dashboard route
- authenticated user retrieval
- middleware/proxy according to the current Next.js/Supabase recommended architecture

## UI foundation

Create:

- responsive application shell
- sidebar
- mobile navigation
- top header
- user menu
- loading states
- empty states
- error states
- toast/notification system
- confirmation dialog

Create a consistent design system.

## Public site

Create a basic landing page structure:

Home
Pricing
Features
Contact

Do not spend excessive time on marketing content yet.

## Quality

Run:

npm install
npm run lint
npm run typecheck
npm test
npm run build

If a script does not exist, add it appropriately.

Fix all errors.

## Security

Confirm:

- no secret is exposed to browser
- .env.local is gitignored
- service-role key is server-only
- authentication state is server-safe
- protected routes work

## STOP

Do not implement:

customers
billing
receipts
expenses
payments
reports

yet.

After completing this phase, provide the required phase report and STOP.