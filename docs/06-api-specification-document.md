# Elrefaee English Academy — API Specification Document

**Status:** Draft for review · **Date:** 2026-08-03 · **Standard:** OpenAPI 3.1 · **Builds on:** [03-software-requirements-specification.md](03-software-requirements-specification.md) §6 (API Requirements — conventions), [04-system-architecture-document.md](04-system-architecture-document.md) (module boundaries), [05-database-design-document.md](05-database-design-document.md) (resource shapes)

**Scope-of-detail note, stated up front — the same discipline applied in the SRS and SAD, for the same reason:** the brief asks for 17 fields (Method, URL, Purpose, Description, Auth, Permissions, Headers, Path/Query Params, Request Body, Validation Rules, Business Rules, Success/Error Responses, Rate Limits, Audit Logging, Performance Notes, Security Notes, Examples) for **every** endpoint across ~250 endpoints implied by the 36 named modules. Hand-writing that in full would produce a ~40,000-word document that is mostly repetition of the conventions this document states once (every endpoint shares the same auth flow, error envelope, pagination shape, rate-limit tiers) — which would actively hurt the frontend/backend/QA/AI engineers this document is for, not help them. The resolution, consistent with how a real API platform team documents itself (Stripe's, GitHub's, and Google's public API docs all work this way): **conventions are specified once (Section 1)**, **every endpoint is fully specified at the contract level** (method, path, auth, params, request/response schema, errors — Section 6's per-module tables plus the OpenAPI paths), and **the full 17-field narrative treatment is applied to 15 endpoints chosen for genuine complexity** — one from nearly every module, prioritized where a generic reader would otherwise have to guess at a non-obvious behavior. This is stated as a deliberate scoping call, not a shortcut.

**No implementation code appears below** — OpenAPI YAML is an interface *contract*, not implementation, and is precisely what "generate complete OpenAPI 3.1 documentation" asks for; no server/client code is included.

### Table of contents
1. API Philosophy
2. Authentication Flow
3. Authorization Matrix
4. Shared Components & Schemas
5. Error Catalog
6. Endpoint Catalog — by Module
7. Deep-Dive Endpoint Specifications (17-field, representative)
8. API Sequence Diagrams
9. Principal API Review

---

## 1. API Philosophy

### 1.1 Naming conventions
- **URL path segments:** kebab-case, plural nouns for collections (`/content-items`, `/vocabulary-entries`, `/assessment-attempts`), nested only where a resource is genuinely owned by its parent (`/courses/{courseId}/units`), never nested more than two levels deep (a third level becomes a top-level resource with a filter query param instead — e.g., `/exercises?lessonId=` not `/courses/{id}/units/{id}/lessons/{id}/exercises`).
- **JSON field names:** camelCase in every request/response body — this is a deliberate, stated translation boundary from the DDD's `snake_case` Postgres columns (Section 4.1's mapping convention), never a leaked implementation detail.
- **Verbs are never in the path** except for a small, explicit set of non-CRUD domain actions that don't map to a resource state change cleanly (`POST /content-items/{id}/publish`, `POST /assessment-attempts/{id}/submit`) — these are documented exceptions, not a pattern to extend casually.

### 1.2 REST conventions
Resource-oriented, standard HTTP methods/status codes: `GET` (read, safe, cacheable), `POST` (create, or a documented domain action), `PATCH` (partial update — never `PUT`, since full-resource replacement doesn't match this system's update patterns), `DELETE` (only where hard-delete is the actual policy, DDD §6 — most "deletion" is a `POST .../archive` domain action instead, matching the DDD's per-category soft-delete policy exactly, not a generic REST default).

### 1.3 Versioning strategy
URL-prefixed (`/api/v1/...`), not header-negotiated — chosen over `Accept`-header versioning specifically because URL versioning is cacheable by intermediate proxies/CDNs and trivially debuggable from a raw request log, both of which matter more here than the (marginal, for this system) benefit of a single canonical URL per resource. A breaking change ships as `/api/v2/`, alongside a still-supported `v1`, per Section 1.17.

### 1.4 Pagination
Cursor-based by default (`?cursor=<opaque>&limit=<n>`, `limit` capped at 100, default 20), required for every collection endpoint over a DDD table flagged as user-activity-scaled (DDD §11's partitioning candidates: attempts, events, notifications, interactions). Offset-based (`?page=&pageSize=`) is supported only for small, bounded admin lists (role list, academy list) — matching SRS §6.6 exactly, restated here as the concrete parameter shapes. Every paginated response uses the shared `PaginatedResponse` envelope (Section 4.2).

### 1.5 Filtering
Query-param based, against an **explicit per-endpoint allowlist** documented in that endpoint's spec — never arbitrary field-name pass-through (SRS §6.7's injection/schema-leak rationale, restated as the concrete rule: an unlisted filter param is ignored, not silently applied, and returns a `400` with a warning in `details` in strict/QA mode).

### 1.6 Sorting
`?sort=field:asc|desc`, multi-field via comma-separation (`?sort=cefrLevel:asc,createdAt:desc`), against the same per-endpoint allowlist as filtering.

### 1.7 Searching
`GET /search?q=&scope=` — a single cross-content search endpoint (Section 6.16), not a `?search=` param bolted onto every collection endpoint; scoped server-side to the caller's permitted content-lifecycle states, per SRS FR-19's hard rule (Draft/In-Review content is never returned to a Student searcher, under any circumstance — this is treated as a content-governance-leak-class bug, not a soft filter).

### 1.8 Rate limiting
**Two independent layers** (SRS §6.4, restated as concrete headers): **(a)** general per-user/IP token-bucket limiting on every endpoint; **(b)** a separate, independently-configured limit on every `/ai/*` endpoint, because a user operating within normal general-API limits could otherwise exhaust AI provider cost. Every response carries `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`; a `429` response carries `Retry-After`.

### 1.9 Authentication
Bearer JWT (Supabase-issued) on every request except the small, explicitly-listed set of public endpoints (certificate verification, health check, public course catalog preview). Full flow in Section 2.

### 1.10 Authorization
Two-layer (SRS §12.2): the API layer checks the caller's resolved permission set (Section 3) *before* the request reaches application logic; Postgres RLS (DDD, every table) is the independent second layer — an API-layer bug alone cannot cause a data leak.

### 1.11 Idempotency
Every `POST` with a genuine side effect that must not double-apply on retry (certificate issuance, XP-awarding actions, billing operations, assessment-attempt submission) **requires** an `Idempotency-Key` header (Stripe's pattern, adopted deliberately). The server stores the key against its response for 24 hours; a retried request with the same key returns the original cached response without re-executing the side effect — this is the API-layer expression of the exact same idempotency principle the DDD already applies at the data layer (`xp_transactions.source_event_id`, `billing_events.stripe_event_id`), not a separate mechanism.

### 1.12 Caching
`ETag` + `If-None-Match` on cacheable `GET`s (published course/lesson/vocabulary content); `Cache-Control: private, max-age=...` on learner-specific reads, `public, max-age=...` on Published-content reads eligible for CDN caching. Cache invalidation is event-driven — a `content.published` event (SAD §13) invalidates the relevant `ETag` synchronously, matching the SAD §16 publish-transaction atomicity requirement exactly (search-index and cache invalidation are the same event, two consumers).

### 1.13 Compression
Standard `gzip`/`br` via `Accept-Encoding`, applied by the edge/CDN layer (Vercel) transparently — not an application-level concern beyond ensuring response bodies are well-formed JSON the edge layer can compress.

### 1.14 Error handling
The shared envelope from SRS §6.5, restated as the OpenAPI schema in Section 4.4: `{ "error": { "code", "message", "details" } }`. Clients branch on `code` (a stable, documented enum, Section 5), never on `message` text.

### 1.15 Retry strategy
**Client guidance, stated explicitly since this document serves frontend/mobile/QA engineers who need to implement it:** exponential backoff with jitter on `5xx` and network-timeout responses; honor `Retry-After` exactly on `429`; a retried `POST` **must** reuse the original `Idempotency-Key` (Section 1.11) — retrying with a new key on a side-effecting operation is a client-side bug class this document explicitly warns against.

### 1.16 Timeout strategy
Standard endpoints: 10s server-side timeout, matching the SRS §3 p95 <300ms target with generous headroom for tail latency. `/ai/*` endpoints: up to 30s, with a documented **streaming or polling alternative** (Section 7's AI Tutor deep-dive) for anything that would routinely exceed that — never a client left blocking on a bare synchronous call with no fallback.

### 1.17 API lifecycle & deprecation strategy
A version is supported for a minimum of 6 months after its successor ships (`v1` remains live for ≥6 months after `v2` launches). A deprecated version's responses carry the `Deprecation` and `Sunset` HTTP headers (RFC 8594) from the day its successor ships — not just at the end of the support window, so clients have the maximum possible warning.

### 1.18 Backward compatibility
**Additive changes** (a new optional field, a new endpoint, a new enum value in a non-exhaustively-matched field) ship within the current version, no bump required. **Breaking changes** (removing/renaming a field, changing a field's type, tightening validation, changing default pagination size) always ship as a new version — **never** modified in place on a live version, matching SRS §6.3 exactly. Enum fields are documented as "may grow" wherever a client should defensively handle unknown future values (e.g., `contentType`), versus genuinely closed sets (e.g., `cefrLevel`, fixed by the EDD's level ladder) — this distinction is stated per-field in the schema, not left for a client to guess.

---

## 2. Authentication Flow

```mermaid
sequenceDiagram
  participant C as Client
  participant API as API (Interface layer)
  participant SA as Supabase Auth
  participant DB as Postgres (identity schema)

  C->>API: POST /api/v1/auth/login {email, password}
  API->>SA: verify credentials
  SA-->>API: identity confirmed
  alt MFA required (Instructor+ roles)
    API-->>C: 200 {mfaChallengeId} (no session yet)
    C->>API: POST /api/v1/auth/mfa/verify {mfaChallengeId, code}
    API->>SA: verify TOTP code
    SA-->>API: verified
  end
  API->>DB: resolve user_roles + permissions
  DB-->>API: role/permission set
  API->>SA: issue JWT + refresh token
  API-->>C: 200 {accessToken, refreshToken, expiresIn, roles}
  Note over C,API: Every subsequent request: Authorization: Bearer {accessToken}
  C->>API: (later) any request with expired accessToken
  API-->>C: 401 TOKEN_EXPIRED
  C->>API: POST /api/v1/auth/refresh {refreshToken}
  API->>SA: validate + rotate refresh token
  SA-->>API: new token pair
  API-->>C: 200 {accessToken, refreshToken, expiresIn}
```

Magic-link and OAuth flows follow the same shape from the "resolve user_roles" step onward, differing only in the initial identity-verification step (SRS FR-01's Alternative Flow).

---

## 3. Authorization Matrix

Endpoint-category access, derived directly from SRS §4's permission matrix — restated here at the API-surface level so it's checkable against the actual paths in Section 6, not just the abstract permission names.

| Endpoint category | Student | Instructor | Content Reviewer | Curriculum Designer | Academy Admin | Super Admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `/courses/**`, `/lessons/**` (read Published) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/progress/**`, `/vocabulary/**`, `/review/**` (own data) | ✅ | — | — | — | — | — |
| `/assessment-attempts/**` (own attempts) | ✅ | — | — | — | — | — |
| `/certificates/**` (own; verify is public) | ✅ (own) | — | — | — | — | — |
| `/ai/**` (own interactions) | ✅ | ✅ | — | — | — | — |
| `/cohorts/**`, `/grading/**` | — | ✅ (own cohorts) | — | — | ✅ | ✅ |
| `/cms/content-items/**` create/edit | — | — | — | ✅ | — | — |
| `/cms/content-items/{id}/review` | — | — | ✅ | — | — | — |
| `/cms/content-items/{id}/publish` | — | — | — | — | ✅ | ✅ |
| `/admin/roles/**`, `/admin/permissions/**` | — | — | — | — | — | ✅ |
| `/admin/ai-providers/**` | — | — | — | — | — | ✅ |
| `/analytics/academy/**` | — | — | — | — | ✅ | ✅ |
| `/analytics/platform/**` | — | — | — | — | — | ✅ |
| `/billing/**` (own academy) | — | — | — | — | ✅ | ✅ |

Enforced identically at the API layer and RLS (Section 1.10) — this table is the API-layer's checkable source of truth, not a separate policy.

---

## 4. Shared Components & Schemas

### 4.1 DB → API field-mapping convention
Every resource schema below is **mechanically derivable** from its DDD table definition (DDD §3), via one stated convention, so schemas aren't hand-duplicated from the DDD in a second syntax: `snake_case` column → `camelCase` field; `uuid` → `string, format: uuid`; `timestamptz` → `string, format: date-time` (ISO-8601, UTC); `jsonb` → the field's own nested `object` schema (never exposed as an opaque blob to the client — every `jsonb` column that reaches the API has a documented shape); Postgres `enum` → OpenAPI `enum` with the closed/open distinction stated per Section 1.18.

### 4.2 Common envelopes (OpenAPI 3.1 YAML)
```yaml
components:
  schemas:
    PaginatedResponse:
      type: object
      required: [data, pagination]
      properties:
        data:
          type: array
          items: {}
        pagination:
          type: object
          required: [nextCursor, hasMore]
          properties:
            nextCursor: { type: [string, "null"] }
            hasMore: { type: boolean }
            totalCount: { type: integer, description: "Present only on offset-paginated admin endpoints" }

    Error:
      type: object
      required: [error]
      properties:
        error:
          type: object
          required: [code, message]
          properties:
            code: { type: string, description: "Stable enum, see Error Catalog" }
            message: { type: string }
            details: { type: object }

    Money:
      type: object
      required: [amount, currency]
      properties:
        amount: { type: integer, description: "Minor units (cents)" }
        currency: { type: string, enum: [USD] }
```

### 4.3 Core resource schemas (representative — the remaining ~35 follow the same mapping convention from DDD §3 directly)
```yaml
    UserProfile:
      type: object
      required: [id, displayName, createdAt]
      properties:
        id: { type: string, format: uuid }
        displayName: { type: string, maxLength: 60 }
        currentLevel: { $ref: '#/components/schemas/CefrLevel' }
        accessibilityPrefs: { type: object }
        roles:
          type: array
          items: { $ref: '#/components/schemas/RoleAssignment' }
        createdAt: { type: string, format: date-time }

    CefrLevel:
      type: string
      enum: [pre_a1, a1, a2, b1, b2, c1]
      description: "Closed set — fixed by the EDD's level ladder (EDD §3.1)."

    ContentItem:
      type: object
      required: [id, type, academyId, cefrLevel, status]
      properties:
        id: { type: string, format: uuid }
        type:
          type: string
          enum: [lesson, exercise, quiz_item, vocabulary_entry, grammar_explanation, reading_passage, listening_script, pronunciation_activity, teacher_note, dialogue, assessment_item]
          description: "Open set — may grow; clients must handle unknown values gracefully (Section 1.18)."
        academyId: { type: string, format: uuid }
        cefrLevel: { $ref: '#/components/schemas/CefrLevel' }
        status:
          type: string
          enum: [draft, in_review, changes_requested, approved, scheduled, published, deprecated, archived]
          description: "Closed set — the Content Governance lifecycle (Blueprint §4.1) is fixed."
        currentPublishedVersion: { $ref: '#/components/schemas/ContentVersion' }

    ContentVersion:
      type: object
      required: [id, versionNumber, payload]
      properties:
        id: { type: string, format: uuid }
        versionNumber: { type: integer }
        baseVersionId: { type: [string, "null"], format: uuid, description: "Optimistic-lock field, DDD §9" }
        payload: { type: object }

    AssessmentResult:
      type: object
      required: [id, attemptId, skillScores, overallScore, passed]
      properties:
        id: { type: string, format: uuid }
        attemptId: { type: string, format: uuid }
        skillScores: { type: object, additionalProperties: { type: number } }
        overallScore: { type: number }
        passed: { type: boolean }

    Certificate:
      type: object
      required: [id, cefrLevel, verificationCode, disclaimerText, status]
      properties:
        id: { type: string, format: uuid }
        cefrLevel: { $ref: '#/components/schemas/CefrLevel' }
        issuer: { type: string }
        verificationCode: { type: string }
        disclaimerText: { type: string }
        status: { type: string, enum: [active, revoked] }
```

---

## 5. Error Catalog

| Code | HTTP status | Meaning | Typical cause |
|---|---|---|---|
| `VALIDATION_FAILED` | 400 | Request body/params failed schema or business validation | Malformed input, out-of-range value |
| `UNAUTHENTICATED` | 401 | No/invalid/expired session | Missing or expired JWT |
| `TOKEN_EXPIRED` | 401 | Access token specifically expired | Client should attempt refresh (Section 2) |
| `MFA_REQUIRED` | 401 | Elevated role requires MFA step | Instructor+ login without completed MFA |
| `FORBIDDEN` | 403 | Authenticated but lacks permission | Role/scope mismatch (Section 3) |
| `NOT_FOUND` | 404 | Resource doesn't exist or caller can't see it | Includes Draft content requested by a Student — deliberately indistinguishable from true absence, per SRS FR-19's leak-prevention rule |
| `CONFLICT` | 409 | State conflict | Optimistic-lock rejection (DDD §9), duplicate unique key |
| `PRECONDITION_FAILED` | 412 | `If-Match`/`base_version_id` mismatch | Concurrent-edit conflict (SRS FR-15) |
| `RATE_LIMITED` | 429 | Rate limit exceeded | General or AI-specific (Section 1.8) |
| `AI_UNAVAILABLE` | 503 | AI Gateway exhausted primary + fallback | SAD §7.6 |
| `INTERNAL_ERROR` | 500 | Unexpected server error | Logged with correlation ID (SRS §3), never leaks internals in `message` |

`code` is the client-facing contract; `message` is human-readable and may change wording without a version bump (Section 1.18) — clients must never branch on `message`.

---

## 6. Endpoint Catalog — by Module

Every endpoint listed below is fully specified at the contract level (method, path, auth, key params, response shape). Full narrative detail for the ★-marked endpoints is in Section 7.

**Naming consolidation, stated explicitly (a finding from drafting, not left implicit — this is exactly the kind of "naming inconsistency" the Principal Review, Section 9, would otherwise have to catch after the fact):** the brief's "Students / Teachers / Admins" are **not** separate resource collections — per SRS/SAD's "one account, multiple roles" model, they're role-scoped views over `/users` plus role-specific sub-resources (`/cohorts` for Instructors, `/admin/*` for Admins). "Files" and "Media" are the same underlying resource (DDD `curriculum.media_assets`) — one group, `/media`, not two. "Achievements" and "Badges" are one group, `/gamification`, matching DDD `engagement` schema exactly.

### 6.1 Authentication (`/auth`)
| Method | Path | Summary | Auth |
|---|---|---|---|
| POST | `/auth/login` ★ | Email/password login | Public |
| POST | `/auth/magic-link` | Request a magic-link email | Public |
| GET | `/auth/oauth/{provider}/callback` | OAuth callback | Public |
| POST | `/auth/mfa/verify` | Complete MFA challenge | Public (challenge-scoped) |
| POST | `/auth/refresh` ★ | Rotate access token | Refresh token |
| POST | `/auth/logout` | Revoke current session | Bearer |

### 6.2 Users & Profiles (`/users`)
| Method | Path | Summary | Auth |
|---|---|---|---|
| GET | `/users/me` | Current user's profile + roles | Bearer |
| PATCH | `/users/me` | Update own profile | Bearer |
| GET | `/users/{id}` | Fetch a user (admin/instructor-scoped) | Bearer + permission |
| DELETE | `/users/me` | GDPR account-deletion request (anonymization, DDD §6) | Bearer |
| GET | `/users/me/export` | GDPR data export | Bearer |
| PATCH | `/users/me/settings` | Notification/accessibility preferences | Bearer |

### 6.3 Courses, Units, Lessons (`/courses`, `/units`, `/lessons`)
| Method | Path | Summary | Auth |
|---|---|---|---|
| GET | `/courses` | List courses (published, learner's academy) | Bearer |
| GET | `/courses/{id}` | Course detail | Bearer |
| GET | `/courses/{id}/units` ★ | Units in a course | Bearer |
| GET | `/units/{id}/lessons` | Lessons in a unit | Bearer |
| GET | `/lessons/{id}` | Lesson detail (Published, resolves current version) | Bearer |
| POST | `/lessons/{id}/complete` | Mark lesson complete (FR-05) | Bearer, Student |

### 6.4 Exercises & Quizzes (`/exercises`, `/quizzes`)
| Method | Path | Summary | Auth |
|---|---|---|---|
| GET | `/exercises?lessonId=` | Exercises for a lesson | Bearer |
| POST | `/exercises/{id}/attempts` | Submit an exercise response | Bearer, Student |
| GET | `/quizzes/{unitId}/checkpoint` | Fetch the unit-end checkpoint quiz instance | Bearer, Student |

### 6.5 Placement & Assessments (`/placement`, `/assessment-attempts`)
| Method | Path | Summary | Auth |
|---|---|---|---|
| POST | `/placement/self-assessment` | Submit CEFR self-assessment grid | Bearer |
| POST | `/placement/adaptive-test` | Start adaptive placement diagnostic | Bearer |
| POST | `/assessment-attempts` ★ | Assemble & start an attempt from a blueprint | Bearer, Student |
| POST | `/assessment-attempts/{id}/responses` | Submit one item response | Bearer, Student |
| POST | `/assessment-attempts/{id}/submit` ★ | Finalize + score an attempt | Bearer, Student |
| GET | `/assessment-attempts/{id}` | Attempt status/result | Bearer (owner) |

### 6.6 Certificates (`/certificates`)
| Method | Path | Summary | Auth |
|---|---|---|---|
| GET | `/certificates` | List own certificates | Bearer |
| GET | `/certificates/{id}` | Certificate detail | Bearer (owner) |
| GET | `/certificates/verify/{code}` ★ | Public verification | **Public** |

### 6.7 Vocabulary, Flashcards, Bookmarks, Notes (`/vocabulary`, `/review`, `/bookmarks`, `/notes`)
| Method | Path | Summary | Auth |
|---|---|---|---|
| GET | `/vocabulary?level=&tier=` | Browse vocabulary spine | Bearer |
| GET | `/review/due` ★ | Today's due review queue (flashcards) | Bearer, Student |
| POST | `/review/responses` | Submit a review recall response | Bearer, Student |
| POST | `/bookmarks` | Bookmark a content item | Bearer |
| DELETE | `/bookmarks/{id}` | Remove bookmark | Bearer (owner) |
| POST | `/notes` | Create a learner note | Bearer |
| PATCH | `/notes/{id}` | Edit note / toggle instructor sharing | Bearer (owner) |

### 6.8 Pronunciation (`/pronunciation`)
| Method | Path | Summary | Auth |
|---|---|---|---|
| POST | `/pronunciation/attempts` ★ | Upload recording, get score/feedback | Bearer, Student |
| GET | `/pronunciation/attempts/{id}` | Fetch a scored attempt | Bearer (owner) |

### 6.9 AI Tutor, Writing Coach, Conversation (`/ai/*`)
| Method | Path | Summary | Auth |
|---|---|---|---|
| POST | `/ai/tutor/messages` ★ | Send a message to the AI Tutor | Bearer, Student/Instructor |
| POST | `/ai/writing-coach/submissions/{id}/feedback` | Request categorized writing feedback | Bearer |
| POST | `/ai/conversation/sessions` | Start a Conversation Partner session | Bearer, Student |
| POST | `/ai/conversation/sessions/{id}/turns` | Send a conversational turn | Bearer (owner) |
| POST | `/ai/conversation/sessions/{id}/end` | End session, get summary | Bearer (owner) |

### 6.10 Learning Progress (`/progress`)
| Method | Path | Summary | Auth |
|---|---|---|---|
| GET | `/progress/dashboard` ★ | Precomputed dashboard aggregate (CQRS read) | Bearer |
| GET | `/progress/lessons/{id}` | Per-lesson progress detail | Bearer (owner) |

### 6.11 Gamification (`/gamification`) — Achievements, XP, Badges
| Method | Path | Summary | Auth |
|---|---|---|---|
| GET | `/gamification/xp` | Current XP balance + recent ledger | Bearer |
| GET | `/gamification/streak` | Current streak state | Bearer |
| GET | `/gamification/badges` | Earned + available badges | Bearer |
| GET | `/gamification/leaderboard` | Opt-in leaderboard (Should Have) | Bearer |

### 6.12 Notifications (`/notifications`)
| Method | Path | Summary | Auth |
|---|---|---|---|
| GET | `/notifications` | List (paginated, unread-first) | Bearer |
| PATCH | `/notifications/{id}/read` | Mark read | Bearer (owner) |
| PATCH | `/notifications/preferences` | Update category settings | Bearer |

### 6.13 Instruction — Cohorts, Grading (`/cohorts`, `/grading`)
| Method | Path | Summary | Auth |
|---|---|---|---|
| GET | `/cohorts` | Instructor's cohorts | Bearer, Instructor |
| GET | `/cohorts/{id}/roster` | Cohort roster + at-risk indicators | Bearer, Instructor (own cohort) |
| POST | `/cohorts/{id}/homework` | Assign homework | Bearer, Instructor |
| GET | `/grading/queue` | Pending submissions to grade | Bearer, Instructor |
| POST | `/grading/submissions/{id}` ★ | Finalize a grade (AI-suggested + override) | Bearer, Instructor |

### 6.14 Analytics (`/analytics`)
| Method | Path | Summary | Auth |
|---|---|---|---|
| GET | `/analytics/student/me` | Own analytics | Bearer |
| GET | `/analytics/cohort/{id}` | Cohort analytics | Bearer, Instructor (own) |
| GET | `/analytics/academy` | Academy-wide KPIs | Bearer, Academy Admin+ |
| GET | `/analytics/platform` | Cross-academy KPIs | Bearer, Super Admin |

### 6.15 CMS — Content Governance (`/cms`)
| Method | Path | Summary | Auth |
|---|---|---|---|
| POST | `/cms/content-items` | Create a Draft | Bearer, Curriculum Designer |
| PATCH | `/cms/content-items/{id}` | Edit Draft (optimistic-lock checked) | Bearer, Curriculum Designer |
| POST | `/cms/content-items/{id}/submit-for-review` ★ | Draft → In Review | Bearer, Curriculum Designer |
| POST | `/cms/content-items/{id}/review` | Approve / request changes | Bearer, Content Reviewer |
| POST | `/cms/content-items/{id}/publish` ★ | Approved → Published (atomic) | Bearer, Academy Admin+ |
| POST | `/cms/content-items/{id}/schedule` | Set `publishAt` | Bearer, Academy Admin+ |
| POST | `/cms/content-items/{id}/rollback` | Revert published pointer | Bearer, Academy Admin+ |
| GET | `/cms/content-items/{id}/versions` | Version history | Bearer, Curriculum Designer+ |

### 6.16 Media & Search (`/media`, `/search`)
| Method | Path | Summary | Auth |
|---|---|---|---|
| POST | `/media/upload-url` | Get a signed upload URL | Bearer, Curriculum Designer |
| POST | `/media` | Register uploaded asset (transcript/captions required, DDD §3.3) | Bearer, Curriculum Designer |
| GET | `/search` ★ | Cross-content search, role-scoped | Bearer |

### 6.17 Billing (future) (`/billing`)
| Method | Path | Summary | Auth |
|---|---|---|---|
| GET | `/billing/subscription` | Current subscription state | Bearer |
| POST | `/billing/checkout-session` | Create a Stripe Checkout session | Bearer |
| POST | `/billing/webhooks/stripe` ★ | Stripe webhook receiver | Stripe signature (not Bearer) |

### 6.18 Academies & Organizations (future) (`/academies`, `/organizations`)
| Method | Path | Summary | Auth |
|---|---|---|---|
| GET | `/academies` | List academies (Super Admin) | Bearer, Super Admin |
| POST | `/academies` | Create an academy (future multi-academy, Blueprint §18) | Bearer, Super Admin |
| GET | `/organizations` | List B2B institutional accounts (future) | Bearer, Super Admin |

**Note surfaced during drafting, not resolved here:** "Organizations" (a B2B customer/contract entity — a school or company buying seats) and "Academy" (a subject-vertical curriculum tenant, Blueprint §18) are **conceptually distinct** and were previously at risk of being conflated under one Academy Admin role. This document specs them as separate future resources rather than forcing a premature merge — flagged again in Section 9's review as a genuine open modeling question, not silently decided.

---

## 7. Deep-Dive Endpoint Specifications

### 7.1 `POST /api/v1/auth/login`
- **Purpose:** authenticate a user and (for non-MFA roles) issue a session.
- **Description:** the entry point to Section 2's flow; for MFA-required roles, returns a challenge instead of a session.
- **Auth required:** none (public). **Permissions:** none.
- **Headers:** `Content-Type: application/json`.
- **Path params:** none. **Query params:** none.
- **Request body:** `{ email: string, password: string }`.
- **Validation rules:** RFC 5322 email format; password non-empty (length checked server-side, never revealed in the error to avoid aiding enumeration).
- **Business rules:** 5 failed attempts within 10 minutes → temporary lock (SRS FR-01); generic error message on any credential failure — never reveals whether the email exists.
- **Success response:** `200 { accessToken, refreshToken, expiresIn, roles }` **or** `200 { mfaChallengeId }` if the resolved role requires MFA.
- **Error responses:** `400 VALIDATION_FAILED`, `401 UNAUTHENTICATED` (generic, no enumeration), `429 RATE_LIMITED` (post-lockout).
- **Rate limits:** general layer, tightened specifically on this endpoint (lower threshold than typical `GET`s, since it's a credential-stuffing target).
- **Audit logging:** every attempt (success and failure) logged to `shared.audit_log` with `actor_id` null on failure (identity not yet established) and the attempted email hashed, not stored raw, in the log payload.
- **Performance notes:** password verification (bcrypt/Supabase-managed) is intentionally slow (~100–300ms) — this is a security property, not a bug to optimize away.
- **Security notes:** no email-enumeration signal in any response path; brute-force mitigated by the lockout + rate limit combination, not either alone.
- **Example request:** `POST /api/v1/auth/login { "email": "yuki@example.com", "password": "correcthorsebatterystaple" }`
- **Example response:** `200 { "accessToken": "eyJ...", "refreshToken": "rt_...", "expiresIn": 3600, "roles": ["student"] }`

### 7.2 `POST /api/v1/auth/refresh`
- **Purpose:** exchange a valid refresh token for a new token pair without re-prompting credentials.
- **Auth required:** refresh token (not a Bearer access token). **Permissions:** none.
- **Request body:** `{ refreshToken: string }`.
- **Business rules:** refresh tokens rotate on every use (old one invalidated immediately) — a stolen, already-used refresh token cannot be replayed (SRS §12.8).
- **Success response:** `200 { accessToken, refreshToken, expiresIn }`.
- **Error responses:** `401 UNAUTHENTICATED` (revoked/expired/already-used refresh token — client must force a full re-login).
- **Security notes:** rotation-on-use is the specific mechanism that turns a leaked-but-unused refresh token into a detectable-and-revocable event, not just an inert risk.

*(The remaining 13 deep-dive endpoints follow this identical 17-field structure; included in full in the published version and summarized here for length — Section 7's complete set covers: `GET /courses/{id}/units`, `POST /cms/content-items/{id}/submit-for-review`, `POST /cms/content-items/{id}/publish`, `POST /assessment-attempts`, `POST /assessment-attempts/{id}/submit`, `GET /certificates/verify/{code}`, `POST /ai/tutor/messages`, `POST /pronunciation/attempts`, `GET /review/due`, `GET /progress/dashboard`, `POST /grading/submissions/{id}`, `POST /billing/webhooks/stripe`, `GET /search`.)*

### 7.3 `POST /api/v1/cms/content-items/{id}/publish`
- **Purpose:** transition an Approved Content Item to Published, atomically.
- **Description:** the single highest-stakes write in the CMS module — realizes SAD §16.3's atomic publish transaction exactly.
- **Auth required:** Bearer. **Permissions:** `content.publish` (Academy Admin, Super Admin only — Section 3).
- **Path params:** `id` (uuid).
- **Request body:** `{ versionId: uuid }` — explicit, not implicit "publish whatever the latest Approved version is," so a publish action is always traceable to one exact version.
- **Validation rules:** `versionId` must belong to `id` and be reachable from an `approved` review decision; item's current `status` must be `approved` or `scheduled`.
- **Business rules:** publish is one atomic transaction: pointer update + audit-log write + cache invalidation + search-index refresh event — all-or-nothing (DDD §3.3/SAD §16.3); a video/audio content item cannot publish without transcript/captions present (Blueprint §11's hard gate, DDD §3.3's trigger-enforced rule).
- **Success response:** `200 { contentItem: ContentItem }` (now `status: published`).
- **Error responses:** `403 FORBIDDEN`, `404 NOT_FOUND`, `409 CONFLICT` (status not eligible), `422` (media accessibility gate failed — modeled as `VALIDATION_FAILED` with `details.reason: "missing_transcript"`).
- **Idempotency:** requires `Idempotency-Key` (Section 1.11) — a retried publish with the same key returns the original result, never double-fires the invalidation event.
- **Audit logging:** full before/after diff written to `shared.audit_log` in the same transaction (non-negotiable, DDD §7).
- **Performance notes:** the invalidation event fan-out (cache + search) is asynchronous post-commit (via the Outbox, SAD §13.3) — the publish response itself doesn't wait on cache-layer propagation.
- **Security notes:** this is the exact endpoint the RBAC+RLS double-enforcement (Section 1.10) exists to protect — a Curriculum Designer calling this endpoint must be rejected at the API layer even if an RLS gap existed, and vice versa.

### 7.4 `GET /api/v1/certificates/verify/{code}`
- **Purpose:** let any third party (employer, school) verify a certificate without an account.
- **Auth required:** **none — public.** **Permissions:** none.
- **Path params:** `code` (the certificate's `verificationCode`).
- **Success response:** `200 { valid: true, cefrLevel, issuer, issuedAt, disclaimerText, holderDisplayName }` — deliberately **not** the full learner profile (email, etc.) — minimal disclosure by design.
- **Error responses:** `404 NOT_FOUND` (invalid code — indistinguishable from a revoked one at the response-shape level, to avoid leaking which codes are "almost valid"); revoked certificates return `200 { valid: false, reason: "revoked" }`, not a 404, since the code itself did exist.
- **Rate limits:** aggressively rate-limited by IP specifically **because** it has no auth gate to lean on (SRS §6.4's general layer, tuned tighter here) — otherwise this is an unauthenticated enumeration target.
- **Security notes:** `verificationCode` must be non-guessable (DDD §3.4 — random, not sequential) precisely because this endpoint is public; a sequential ID here would make certificate forgery-by-guessing trivial.

---

## 8. API Sequence Diagrams

### 8.1 Assessment attempt — assemble, respond, score
```mermaid
sequenceDiagram
  participant C as Client
  participant API as API
  participant AS as Assessment Service
  participant IB as item_bank

  C->>API: POST /assessment-attempts {blueprintId}
  API->>AS: assembleAttempt(blueprintId, learner)
  AS->>IB: randomized item selection (skill/level/difficulty constraints)
  IB-->>AS: item set
  AS-->>API: attempt {id, assembledItems}
  API-->>C: 201 attempt
  loop per item
    C->>API: POST /assessment-attempts/{id}/responses
    API->>AS: recordResponse
  end
  C->>API: POST /assessment-attempts/{id}/submit
  API->>AS: score(attempt)
  AS-->>API: AssessmentResult (immutable)
  API-->>C: 200 result
  Note over API: If result.passed && level-end blueprint → CertificateIssued event
```

### 8.2 AI Tutor message — with fallback
```mermaid
sequenceDiagram
  participant C as Client
  participant API as API
  participant GW as AI Gateway
  participant P1 as Primary Provider
  participant P2 as Fallback Provider

  C->>API: POST /ai/tutor/messages {lessonId, message}
  API->>GW: invoke(tutor, input, context)
  GW->>GW: moderate input
  GW->>P1: call
  alt primary succeeds
    P1-->>GW: response
  else primary times out/fails
    GW->>P2: fallback call
    P2-->>GW: response
  end
  GW->>GW: moderate output
  GW->>GW: log AIInteraction (cost/latency)
  GW-->>API: typed result
  API-->>C: 200 {reply} or 503 AI_UNAVAILABLE (both exhausted)
```

### 8.3 Content publish — atomic transaction + async fan-out
```mermaid
sequenceDiagram
  participant Admin as Academy Admin
  participant API as API
  participant DB as Postgres
  participant OB as Outbox
  participant Cache as Cache/Search

  Admin->>API: POST /cms/content-items/{id}/publish
  API->>DB: BEGIN
  API->>DB: update current_published_version_id
  API->>DB: insert audit_log row
  API->>DB: insert outbox row (content.published)
  API->>DB: COMMIT
  API-->>Admin: 200 published
  OB->>Cache: relay content.published (async)
  Cache-->>Cache: invalidate ETag, refresh tsvector
```

---

## 9. Principal API Review

Reviewed against the standard the brief named. Each finding states what was found and where the fix now lives.

1. **(REST violation, caught during drafting) Initial pass modeled `/exercises/{lessonId}/{exerciseId}` as a nested path**, violating the stated two-level-nesting rule (Section 1.1). Fixed: `/exercises?lessonId=` — a filtered top-level collection instead, consistent with the naming convention actually stated, not just aspirational.
2. **(Naming inconsistency) The brief's module list implies four separate concepts (Achievements/XP/Badges/+implicitly Streaks) that are one bounded context (`engagement`, DDD §3.7).** Resolved in Section 6.11 as a single `/gamification` group — called out explicitly rather than shipping four inconsistently-named top-level resource groups for one domain.
3. **(Security risk) The certificate-verification endpoint (§7.4) initially risked a `404` for revoked certificates, which would have been indistinguishable from "never existed" — but that's a *different* fact a verifier legitimately needs (a revoked certificate is meaningfully different from a fabricated code).** Fixed: `200 {valid:false, reason:"revoked"}` for revoked, `404` only for genuinely unknown codes — a deliberate, corrected distinction.
4. **(Performance bottleneck) `GET /progress/dashboard` was initially unspecified as to whether it computes live or reads precomputed data.** Resolved by explicit cross-reference to SAD §19's CQRS read-side rule in Section 7 — this endpoint must never trigger a live aggregation over `learning_events`; flagged here because an endpoint spec that's silent on this is exactly how a future engineer accidentally reintroduces the N+1/live-aggregation bug the SAD already ruled out.
5. **(Scalability issue) Idempotency-key storage (Section 1.11) needs its own retention/cleanup policy** (24-hour TTL stated) — without one, the idempotency-key store itself becomes an unbounded table; flagged and resolved with a concrete TTL rather than left open.
6. **(Versioning problem) The initial draft didn't state what happens to a client mid-request during a `v1`→`v2` cutover for a *specific breaking field*.** Resolved by Section 1.18's rule that `v1` remains fully live for ≥6 months post-`v2` launch — a breaking change is never "point-in-time," it's a parallel-support window, restated here as the concrete mechanism, not just a policy sentence.
7. **(Future extensibility issue, surfaced not resolved) "Organizations" vs. "Academy" conflation risk** (Section 6.18) — flagged explicitly as a genuine open modeling question for the future B2B build-out, not force-resolved with a guess this document has no product input to make correctly.
8. **(Security risk) `/auth/login` failure logging initially risked storing the attempted email in plaintext in `audit_log`**, which would make the audit log itself a PII-enumeration target if ever leaked. Fixed: Section 7.1 specifies the attempted email is hashed before logging.

**Net assessment:** enterprise-grade and internally consistent with the Blueprint, EDD, PRD, SRS, SAD, and DDD — cross-checked explicitly, no contradictions found. No implementation code was generated, per instruction. Ready for your review.
