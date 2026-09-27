---
name: axia-verify-feature-wiring
description: "Use before describing any AxiaERP feature, business rule, or handler as 'implemented', 'working', or 'already handles X' — this codebase has a confirmed, repeated pattern of entities/DTOs/handlers/frontend pages that exist but are never actually called by the code path you'd expect. Trigger whenever a task depends on an assumption that existing code already does something, or when auditing a module to find what's real vs. dead."
---

# Verifying a feature is actually wired up (not just present)

AxiaERP's codebase has a confirmed pattern: a feature looks complete — entity, DTO, handler, repository method, even a working frontend page — but the code path that should invoke it doesn't. Found instances: `Company.CgNumCltDefault`/GL-account defaults (full CRUD, nothing reads it at creation time), `TableNumerotation`/`GetNextArticleReferenceQueryHandler` (real generation logic, never called by article creation), `SouchesClient`'s numbering generator (preview-only, not enforced), Vente document `Numero` (always free text, no generation logic exists at all despite looking like it should). Never assume a similar-looking feature elsewhere is different until you've checked.

## The check, step by step

1. **Find the "does the work" code** — the handler, repository method, or service function that actually performs the behavior in question (e.g. `GetNextArticleReferenceQueryHandler.Handle`).
2. **Grep for its callers** — search the whole solution (not just the obvious controller) for where this handler/method is actually invoked: `grep -rn "GetNextArticleReferenceQuery" --include=*.cs`. A MediatR command/query class existing is not evidence it's sent anywhere — find the actual `_mediator.Send(...)` or equivalent call site.
3. **Find the frontend caller** — if the feature should be triggered by a UI action, grep the frontend for the actual API call (`fetch`/axios/service call) that would hit the relevant endpoint. A page existing that *could* call it is not evidence it *does*.
4. **Trace the real invocation path** — for the specific user action in question (e.g. "creating an article"), read the actual handler that runs on that action and confirm it calls the feature you're checking, rather than assuming based on proximity or naming.
5. **Check for a second, competing implementation** — this codebase has had cases of two separate mechanisms for the same concept (e.g. `TableNumerotationRepository.IncrementAsync` as a redundant, equally-dead second numbering path). If you find one implementation, keep searching briefly for a sibling before concluding there's only one.
6. **Report precisely** — state what you found as one of: "implemented and called by X", "implemented but not called by anything found", or "not implemented". Never round the middle case up to "implemented" — that distinction is the entire point of this check, and this codebase's history shows it's easy to get wrong by skimming.

## When this changes the answer to a user's question

If asked to add a feature that seems like it should already exist ("doesn't creating an article already generate a reference number?"), run this check before answering — the honest answer in this codebase has repeatedly been "no, despite looking like it should."
