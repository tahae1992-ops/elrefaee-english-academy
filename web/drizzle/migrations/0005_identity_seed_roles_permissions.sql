-- Sprint 2 Task 2: seed data for identity.roles / identity.permissions /
-- identity.role_permissions. SRS §4: "The matrix below is the seed
-- data for role_permissions, not just documentation." Six active
-- roles plus two reserved roles with zero permissions (SRS §4's
-- "Guardian/Parent and Billing/Support Admin rows are reserved... so
-- their eventual addition is a data insert, never a schema
-- migration").

INSERT INTO "identity"."roles" ("key", "description") VALUES
  ('student', 'Learner progressing through the curriculum'),
  ('instructor', 'Teaches and grades within their assigned cohort(s)'),
  ('content_reviewer', 'Reviews curriculum content before publish'),
  ('curriculum_designer', 'Authors curriculum content'),
  ('academy_admin', 'Administers a single academy'),
  ('super_admin', 'Platform-wide administrator'),
  ('guardian', 'Reserved — Guardian/Parent (SRS §4), zero permissions until built'),
  ('billing_support_admin', 'Reserved — Billing/Support Admin (SRS §4), zero permissions until built');

INSERT INTO "identity"."permissions" ("key", "description") VALUES
  ('progress.view_own', 'View own progress/notebook/certificates'),
  ('learning.attempt', 'Attempt lessons/exercises/assessments'),
  ('cohort.view_roster_analytics', 'View cohort roster & analytics (scope enforced by RLS via user_roles.academy_id)'),
  ('homework.assign_track', 'Assign/track homework'),
  ('submissions.grade', 'Grade submissions (with AI-suggested pre-fill)'),
  ('content.create_edit_draft', 'Create/edit Draft content'),
  ('content.review', 'Review content, request changes / advance to Approved'),
  ('content.publish_schedule', 'Publish / schedule content'),
  ('content.restore_version', 'Restore prior content versions'),
  ('users.manage_within_academy', 'Manage user accounts within academy'),
  ('roles.manage', 'Manage roles/permissions'),
  ('ai.configure_providers', 'Configure AI providers/modules'),
  ('kpis.view_academy_wide', 'View academy-wide business KPIs'),
  ('kpis.view_cross_academy', 'View cross-academy platform KPIs'),
  ('billing.manage', 'Manage billing/subscription plans'),
  ('audit_log.access', 'Access audit log');

-- SRS §4's matrix, literally. `cohort.view_roster_analytics` is one
-- permission key shared by Instructor/Academy Admin/Super Admin; the
-- differing *scope* ("own cohorts only" vs "academy-wide" vs "all
-- academies") is not a separate permission — it's enforced by
-- user_roles.academy_id (NULL = platform-wide) at the RLS layer
-- (DDD §3.1), not by the permission matrix.
INSERT INTO "identity"."role_permissions" ("role_id", "permission_id")
SELECT r.id, p.id
FROM "identity"."roles" r
JOIN "identity"."permissions" p ON true
WHERE (r.key, p.key) IN (
  ('student', 'progress.view_own'),
  ('student', 'learning.attempt'),

  ('instructor', 'cohort.view_roster_analytics'),
  ('instructor', 'homework.assign_track'),
  ('instructor', 'submissions.grade'),

  ('content_reviewer', 'content.review'),

  ('curriculum_designer', 'content.create_edit_draft'),
  ('curriculum_designer', 'content.restore_version'),

  ('academy_admin', 'cohort.view_roster_analytics'),
  ('academy_admin', 'content.publish_schedule'),
  ('academy_admin', 'content.restore_version'),
  ('academy_admin', 'users.manage_within_academy'),
  ('academy_admin', 'kpis.view_academy_wide'),
  ('academy_admin', 'billing.manage'),
  ('academy_admin', 'audit_log.access'),

  ('super_admin', 'cohort.view_roster_analytics'),
  ('super_admin', 'content.publish_schedule'),
  ('super_admin', 'content.restore_version'),
  ('super_admin', 'users.manage_within_academy'),
  ('super_admin', 'roles.manage'),
  ('super_admin', 'ai.configure_providers'),
  ('super_admin', 'kpis.view_academy_wide'),
  ('super_admin', 'kpis.view_cross_academy'),
  ('super_admin', 'billing.manage'),
  ('super_admin', 'audit_log.access')
);
