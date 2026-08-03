-- Rollback for 0005_identity_seed_roles_permissions.sql.
DELETE FROM "identity"."role_permissions"
USING "identity"."roles" r
WHERE "identity"."role_permissions"."role_id" = r.id
  AND r.key IN ('student', 'instructor', 'content_reviewer', 'curriculum_designer', 'academy_admin', 'super_admin', 'guardian', 'billing_support_admin');
DELETE FROM "identity"."permissions" WHERE "key" IN (
  'progress.view_own', 'learning.attempt', 'cohort.view_roster_analytics',
  'homework.assign_track', 'submissions.grade', 'content.create_edit_draft',
  'content.review', 'content.publish_schedule', 'content.restore_version',
  'users.manage_within_academy', 'roles.manage', 'ai.configure_providers',
  'kpis.view_academy_wide', 'kpis.view_cross_academy', 'billing.manage',
  'audit_log.access'
);
DELETE FROM "identity"."roles" WHERE "key" IN (
  'student', 'instructor', 'content_reviewer', 'curriculum_designer',
  'academy_admin', 'super_admin', 'guardian', 'billing_support_admin'
);
