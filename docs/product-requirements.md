# LIBRIS Product and Trust Commitments

**Product:** LIBRIS  
**Tagline:** Discover beyond the page.  
**Status:** Working requirements, aligned to the current project plan.

## Product identity
LIBRIS is a premium editorial-style book discovery and reading product. The product should feel thoughtful and literary rather than like a generic SaaS dashboard. Visual polish must not come at the cost of accessibility, privacy, or clarity.

## Current product decisions
- Frontend: React + TypeScript + Vite.
- Backend: Supabase.
- Catalogue strategy: external live search plus Supabase metadata cache; bulk imports later.
- Authentication plan: Supabase email/password with verification and password reset, plus Google OAuth.
- Commercial direction: free-first. Do not show a premium upsell immediately on entry. A possible LIBRIS Plus tier may be considered later, but essential reading/library functions should not be artificially degraded.
- AI architecture: provider abstraction, secrets server-side, and no fake responses presented as real.
- Planned personal uploads: EPUB/PDF only, with a product-level limit to be enforced server-side; the tentative concept is a maximum of 20 files per account and size/storage caps, to be finalised after implementation and cost testing.

## Privacy and trust requirements
- Private libraries, notes, reading progress, and uploaded files are private by default.
- RLS and server-side ownership checks are required for user-owned data.
- Do not expose service-role keys or AI secrets to the browser.
- Explain what context is sent to an AI provider before enabling relevant features.
- Avoid sending whole books when a smaller relevant passage is sufficient.
- Keep book metadata rights separate from full-text hosting/processing permissions.
- Clearly distinguish public-domain, open-access, preview, borrow, buy, audiobook, and metadata-only records.
- Do not invent book facts, quotes, availability, prices, ratings, popularity, or reviews.
- Enforce spoiler limits in retrieval/application logic, not only in prompts.
- Give users a clear route to manage privacy preferences and request account deletion.
- Do not claim compliance, encryption, deletion, or security capabilities until implemented and tested.

## Release principle
A policy statement is a product commitment. Do not publish it unless the corresponding feature and controls exist, or clearly describe it as a planned feature rather than current behaviour.
