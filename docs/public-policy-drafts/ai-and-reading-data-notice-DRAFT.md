# LIBRIS AI and Reading Data Notice — DRAFT

**Status:** Product disclosure draft; update before any AI feature is enabled  
**Contact:** `[CONTACT EMAIL]`

## Purpose

This notice should appear near the AI feature, not only in the Privacy Policy. It explains the data a user chooses to provide to Libris Assistant, Libris Detective, or the Reading Companion.

## Proposed user-facing explanation

When you ask LIBRIS an AI-powered question, the app may process your prompt and relevant book information to generate an answer. Depending on the feature and the settings you choose, that context may include book metadata, a passage, chapter information, or your current reading position.

If an external AI provider is used, the final notice must name or clearly identify the provider and link to relevant details about processing and retention. Do not enable the feature until the data flow, provider terms, security, and disclosures have been reviewed.

LIBRIS should send only the context needed for the current request. Private notes, entire uploaded books, and full conversation histories should not be sent by default when a smaller context is sufficient.

AI responses may be incorrect or incomplete. Where possible, answers should cite the relevant chapter or location and clearly say when the source text is unavailable or does not support an answer.

## Spoiler settings

The planned Reading Companion may offer:
1. **Protect My Suspense** — restrict retrieval to the user's current reading position where the source text supports this.
2. **Warn Me First** — ask before revealing major spoilers.
3. **Tell Me Everything** — allow full-book questions only when the user explicitly chooses this and the text is available for permitted processing.

These are planned product behaviours until tested. Spoiler protection must be enforced by retrieval/application logic, not just by prompting the AI.

## Before launch, confirm

- [ ] AI provider and model.
- [ ] Exact fields/text sent for each feature.
- [ ] Whether provider retains prompts or uses them for model improvement.
- [ ] Provider region, subprocessors, and transfer safeguards.
- [ ] User controls for deleting conversations and disabling AI.
- [ ] Rate limits, abuse controls, and cost controls.
- [ ] Source-grounding, uncertainty handling, and spoiler-retrieval tests.
- [ ] In-product notice and Privacy Policy agree with actual processing.
