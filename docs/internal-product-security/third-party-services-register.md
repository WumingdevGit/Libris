# LIBRIS Third-Party Services Register

**Status:** Planning register — confirm actual providers before launch.

| Service category | Intended role | Data that may be processed | Required checks before enabling |
|---|---|---|---|
| Supabase | Authentication, database, possibly private storage and Edge Functions | Account IDs, email, user library, progress, notes, files depending on features | Region, DPA/terms, RLS, storage policies, backups, deletion, logs, subprocessors |
| Google OAuth | Optional account sign-in | Only requested identity/profile fields | Consent screen, verified domain, redirect URIs, privacy disclosure, scopes |
| Book metadata/search APIs | External live catalogue search and cached metadata | Search terms/request metadata as defined by API | Terms, rate limits, attribution, caching rights, privacy implications, source freshness |
| AI provider | Requested recommendations and reading questions | Minimise prompts and relevant permitted context | Data retention, training use, region, subprocessors, terms, key security, cost limits |
| Hosting/deployment | Deliver web application | Request and diagnostic logs | Region, HTTPS, access controls, log retention, incident contact |
| Email provider | Verification/reset/support emails if used | Email address and message metadata | DPA/terms, delivery logs, template safety, retention |
| Analytics/cookie tool | Not selected | Do not collect until selected and disclosed | Necessity, consent requirements, data minimisation, opt-out, retention |

For every enabled provider, record: exact product/plan, legal entity, DPA status, regions, subprocessors, data categories, retention, deletion mechanism, security contact, contractual restrictions, and the date the terms were reviewed.

Never mark a provider “approved” merely because a package has been installed.
