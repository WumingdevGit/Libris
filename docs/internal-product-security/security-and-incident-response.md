# LIBRIS Security and Incident Response Plan

**Status:** Internal baseline; assign owners and test before production.

## Minimum security controls

### Accounts and access
- Use Supabase Auth or another supported provider; do not store plaintext passwords.
- Enforce Row Level Security (RLS) on every user-owned table.
- Test read, insert, update, and delete policies using separate test accounts.
- Never trust a user ID sent by the browser without checking the authenticated session.
- Admin/moderator privileges must be assigned and checked server-side, never by hiding/showing UI alone.
- Do not expose Supabase service-role keys or AI provider secrets in client-side environment variables or bundles.

### Files and uploads
- Keep user book files in private storage buckets.
- Verify file type, file size, ownership, quota, and upload result server-side.
- Generate short-lived signed URLs only when needed.
- Do not treat filename extensions as sufficient validation.
- Set and enforce the product's planned upload caps only after confirming the backend enforces them.
- Avoid processing a file or sending its content to an AI provider before access checks and required disclosure.

### APIs and AI
- Validate request shapes and limit body size.
- Add rate limits and cost controls to AI endpoints.
- Keep provider keys server-side in managed secrets.
- Limit retrieved text to the user's permitted reading range and spoiler setting.
- Do not log full private book text, notes, prompts, tokens, passwords, or secrets unnecessarily.
- Handle provider timeouts and errors without exposing secrets or stack traces to users.

### General
- Use HTTPS in production and secure OAuth redirect URIs.
- Keep dependencies updated and review security advisories.
- Back up important data and test restoration.
- Limit staff access and record privileged administrative actions.
- Establish a way to receive security reports at `[SECURITY CONTACT EMAIL]`.

## Incident response

1. **Triage:** Record when the issue was detected, affected systems, suspected data, and current impact.
2. **Contain:** Revoke exposed keys/sessions, disable vulnerable endpoints or uploads, restrict access, and preserve relevant evidence.
3. **Assess:** Determine which data and users may be affected; involve the relevant provider and qualified privacy/security support.
4. **Notify:** Follow applicable legal and contractual notification deadlines and content requirements. Do not guess deadlines; verify the law and incident facts.
5. **Remediate:** Patch the cause, rotate secrets, review access policies, and address affected records.
6. **Recover:** Restore services safely and monitor for recurrence.
7. **Review:** Document root cause, decisions, communications, and follow-up owners without unnecessarily duplicating sensitive data.

## Incident record template

- Incident ID:
- Detected at / by:
- Systems affected:
- Data potentially affected:
- Containment actions:
- Providers contacted:
- Legal/privacy assessment owner:
- Notification decision and rationale:
- Remediation:
- Recovery verification:
- Lessons learned / owner / due date:

Run a tabletop exercise before launch and after major architecture changes.
