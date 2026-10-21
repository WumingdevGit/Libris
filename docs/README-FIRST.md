# LIBRIS Documentation Pack — Read This First

**Project:** LIBRIS — *Discover beyond the page.*  
**Status:** Working drafts for a product still in development  
**Prepared:** 12 October 2026

## Important: these are drafts, not approved legal documents

This pack gives the LIBRIS project a documentation baseline. It is not legal advice and is not ready to publish unchanged. Before public launch, review the documents against the features actually implemented, the legal entity or person operating LIBRIS, the countries where it will be offered, the vendors actually used, and applicable law. Seek qualified legal/privacy review where possible.

The current product checkpoint is an early React + Vite frontend. Supabase authentication, live catalogue integrations, AI processing, uploads, and reader features are planned but are not confirmed as implemented. Do **not** tell users these systems are already active. Update all drafts before publishing.

## Replace these placeholders

- `[OPERATOR LEGAL NAME]` — the person or legal entity operating LIBRIS.
- `[CONTACT EMAIL]` — monitored privacy/support contact.
- `[PUBLIC DOMAIN]` — the final domain you control.
- `[POSTAL ADDRESS, IF REQUIRED]` — add only if appropriate and required.
- `[EFFECTIVE DATE]` — date the policy actually takes effect.
- `[JURISDICTION / GOVERNING LAW]` — have this selected with appropriate advice.
- `[VENDOR NAME]`, `[RETENTION PERIOD]`, and similar fields — verify against the real implementation.

Do not publish any document with unresolved placeholders.

## Folder guide

- `public-policy-drafts/` — draft pages that may eventually appear on the public website.
- `internal-product-security/` — internal implementation and launch controls.
- `product-requirements.md` — documents product commitments and boundaries.
- `launch-checklist.md` — evidence-based go/no-go checklist.

## Suggested implementation order

1. Keep this pack in the project repository under `docs/`.
2. Confirm the product's real data flows and vendors before finalising the Privacy Policy.
3. Implement privacy and security controls alongside authentication, database, and upload features.
4. Publish accessible Privacy Policy and Terms links on the public website before production launch.
5. If Google OAuth is enabled for production, make sure the public homepage and privacy policy are hosted on a verified domain you own and the policy accurately explains the use of Google user data.
6. Review the documents whenever features, vendors, or data practices change.

## Sources to review

- Nigeria Data Protection Commission — NDP Act 2023: https://www.ndpc.gov.ng/ndp-act-2023/
- NDPC privacy policy example and privacy principles: https://erp.ndpc.gov.ng/privacy_policies
- Google OAuth production readiness and homepage requirements: https://developers.google.com/identity/protocols/oauth2/production-readiness/policy-compliance
- Google OAuth verification requirements: https://support.google.com/cloud/answer/13464321

These links are starting points, not a conclusion that any one law or regulatory requirement applies in a particular way to LIBRIS. Confirm applicability before launch.
