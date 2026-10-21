# LIBRIS Privacy, Legal, and Trust Launch Checklist

Use this as a go/no-go checklist. A checkbox should be marked complete only when there is evidence (a test, configuration, reviewed policy, or recorded decision).

## Ownership and contact
- [ ] Operator/legal entity identified.
- [ ] Support, privacy, and security contact routes monitored.
- [ ] Domain ownership and HTTPS confirmed.
- [ ] Applicable jurisdictions and target audience assessed.
- [ ] Qualified legal/privacy review completed where appropriate.

## Public documents
- [ ] Privacy Policy matches the actual deployed product and vendors.
- [ ] Terms of Service reviewed for applicable law and consumer rights.
- [ ] Copyright/book access policy and complaint process ready before relevant features launch.
- [ ] AI and Reading Data Notice visible in the relevant feature.
- [ ] Cookie/analytics notice and consent controls assessed against actual technologies and applicable law.
- [ ] All placeholders removed; effective dates correct.
- [ ] Policies accessible from the public homepage and relevant account flows.

## Authentication and database
- [ ] Email verification, password reset, session handling, and logout tested.
- [ ] Google OAuth redirect URIs and requested scopes reviewed.
- [ ] Production OAuth homepage and privacy links configured on a domain owned by the operator.
- [ ] RLS enabled and tested on every user-owned table.
- [ ] Cross-account access tests pass.
- [ ] Privileged roles cannot be self-assigned.
- [ ] Secrets are server-side; production bundles checked for leaked keys.

## AI and reading data
- [ ] Provider, model, data flow, retention, and region documented.
- [ ] AI usage and cost limits configured.
- [ ] Private content minimised before external processing.
- [ ] Source grounding and uncertainty handling tested.
- [ ] Spoiler policies enforced by retrieval logic and tested.
- [ ] Conversation retention/deletion behaviour tested.

## Uploads and copyright
- [ ] Uploads disabled until private storage and server-side limits are ready.
- [ ] File type/size/quota/ownership validation tested.
- [ ] Signed access is short-lived and authorised.
- [ ] Account deletion removes uploaded objects and metadata as designed.
- [ ] Provider terms/licences and attribution checked for catalogue data and covers.
- [ ] No unauthorised book redistribution.
- [ ] Rights complaint/report process ready before public sharing.

## Operational readiness
- [ ] Retention schedule approved and implemented.
- [ ] Account deletion workflow tested end to end.
- [ ] Backup retention and restoration tested.
- [ ] Incident response plan and escalation contacts recorded.
- [ ] Dependencies and deployment settings reviewed.
- [ ] Accessibility and mobile behaviour checked.
- [ ] Error states are truthful and do not expose secrets.
- [ ] Final build, lint, and relevant tests pass.
