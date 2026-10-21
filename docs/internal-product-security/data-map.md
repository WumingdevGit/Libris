# LIBRIS Data Map and Data Flow

**Status:** Living internal document — update as code and vendors are implemented.  
**Last reviewed:** 12 October 2026

## Current checkpoint

The project is at an early React + Vite frontend milestone. Supabase, real authentication, external catalogue APIs, AI processing, personal uploads, and the reader are planned but are not confirmed as active. The table below is a planning inventory, not proof of current collection.

| Data category | Why it may be needed | Planned location/system | Sensitivity | Required control |
|---|---|---|---|---|
| Account email and auth ID | Sign-in, account management | Supabase Auth if implemented | Personal | Provider-managed auth; least privilege; account deletion process |
| Profile/preferences | Personalisation and settings | Supabase database | Personal | Owner-only RLS; validate fields |
| Book metadata/cache | Search and recommendations | Supabase database/cache | Mostly public metadata | Respect source terms, attribution, deduplication |
| User library/shelves | Save and organise books | Supabase database | Private reading data | RLS; private by default |
| Progress/sessions | Resume reading and statistics | Supabase database | Private behavioural data | Owner-only access; retention controls |
| Notes/highlights/bookmarks | Reading tools | Supabase database | Potentially sensitive private content | Owner-only RLS; minimise external sharing |
| AI prompts/conversations | Provide requested assistant answers | Database and AI provider only if enabled | Private user content | Clear notice; minimise context; deletion; rate limits |
| EPUB/PDF uploads | Personal reader | Private object storage if enabled | User-provided content | Private buckets; quotas; file validation; signed access |
| Security/error logs | Debugging and abuse prevention | Hosting/provider logging | May contain identifiers | Avoid secrets/content; restricted access; retention limits |
| Support messages/reports | Resolve issues | Support channel/database if implemented | Personal | Restricted staff access; retention rules |

## Planned data flow for an AI reading request

1. User submits a question in the reader or assistant.
2. Frontend sends a request to a trusted backend/Edge Function.
3. Backend verifies authentication, request size, rate limits, and the user's access to the book.
4. Retrieval obtains only relevant permitted text and respects the user's spoiler setting.
5. Backend calls the configured AI provider using a server-side secret.
6. The response is validated and returned with source references or an uncertainty message.
7. Conversation persistence occurs only as described to users and in accordance with user settings.

Do not call an AI provider directly from browser code with a secret API key.

## Vendor inventory to complete

| Provider/service | Purpose | Data received | Region | Retention/terms reviewed? | Link/contact |
|---|---|---|---|---|---|
| Supabase | Planned auth/database/storage | To be confirmed by enabled features | To configure | No — pending | `[URL]` |
| Google OAuth | Planned sign-in | OAuth profile fields actually requested | Provider-defined | No — pending | `[URL]` |
| Book catalogue provider(s) | Planned live search | Search request/metadata per API | To verify | No — pending | `[URL]` |
| AI provider | Planned assistant features | To be minimised and confirmed | To verify | No — pending | `[URL]` |
| Hosting provider | Website delivery/logging | Request and diagnostic data per configuration | To verify | No — pending | `[URL]` |
| Analytics/cookies | Not decided | None until selected and enabled | N/A | N/A | `[URL]` |

Update this register before enabling each integration. Record contract/DPA review, subprocessors, data location, transfer safeguards, and incident contact where applicable.
