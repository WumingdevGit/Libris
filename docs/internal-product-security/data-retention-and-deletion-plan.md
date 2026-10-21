# LIBRIS Data Retention and Account Deletion Plan

**Status:** Proposed internal plan; retention periods must be selected and verified before launch.

## Principles

- Collect only what is needed for a stated purpose.
- Assign a retention period to every category before production launch.
- Delete or anonymise information when the purpose ends, subject to applicable legal obligations and defensible security/dispute needs.
- Explain backup delays honestly; do not promise instant deletion from every backup if that is not technically true.
- Ensure account deletion covers database records, object storage, AI conversations, and vendor systems where applicable.

## Retention schedule — complete before launch

| Data category | Proposed rule | Period / decision required | Deletion method / owner |
|---|---|---|---|
| Account/profile | Keep while account is active, then process deletion request | `[PERIOD]` | Auth + profile deletion workflow |
| Library, progress, notes | Keep while account is active or user retains them | `[PERIOD]` | Cascade/delete or export then delete |
| Assistant conversations | User-controlled retention where feasible | `[PERIOD]` | Delete DB records and assess provider retention |
| Uploaded EPUB/PDF | Until user deletes file/account or quota policy applies | `[PERIOD]` | Delete object and metadata; verify storage lifecycle |
| Security logs | Keep only as long as needed for security/operations | `[PERIOD]` | Restricted log retention configuration |
| Support/report records | Retain for resolution and defensible follow-up | `[PERIOD]` | Restricted deletion/archive workflow |
| Backups | Follow documented backup rotation | `[PERIOD]` | Expire through backup lifecycle; disclose delay |
| Cached public metadata | Follow provider terms and freshness policy | `[PERIOD]` | Refresh, expire, or remove records |

## Account deletion workflow

1. Authenticate the request and require re-authentication where appropriate.
2. Explain what will be deleted, what may be retained, and expected backup expiry.
3. Prevent the account from continuing ordinary use once deletion is confirmed.
4. Delete or anonymise profile, user library, shelves, progress, notes, bookmarks, highlights, feedback, and conversations according to the final retention policy.
5. Delete private uploaded objects and associated metadata.
6. Revoke sessions/tokens and remove auth account as supported by the provider.
7. Propagate deletion requests to vendors where required and technically available.
8. Keep only a minimal deletion audit record if justified and permitted; avoid retaining the content itself.
9. Confirm completion to the user without promising that backup copies disappeared instantly.
10. Test deletion using a test account and verify database, storage, and vendor outcomes.

## Required tests

- [ ] User A cannot delete or read User B's data.
- [ ] Account deletion removes all user-owned tables/objects intended for deletion.
- [ ] Partial failure is retried or surfaced for manual remediation.
- [ ] Backup expiry is documented.
- [ ] The public Privacy Policy matches the actual workflow.
