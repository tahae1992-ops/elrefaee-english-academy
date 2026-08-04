-- RLS for the Course Catalog's curriculum tables (SRS §12.2).
--
-- content_items: a learner may read a row only once it's `published` —
-- this is the actual enforcement of SRS FR-04's "Only Published content
-- is ever exposed to Students" rule at the query layer, not just a UI
-- filter. Draft/in_review/etc. rows stay invisible to every client role;
-- only our own server-side route handlers (via the `postgres`-role
-- connection, bypassing RLS) can see unpublished content, e.g. for a
-- future CMS preview feature.
--
-- courses: read-only reference data, same pattern as
-- identity.roles/permissions/academies (0004_identity_tables_rls.sql) —
-- the row itself (which CEFR level has a course) isn't sensitive; the
-- wireframe explicitly shows locked courses in the list (doc 08 §4.7).
-- No write policy for either table: seed/authoring writes go through
-- the service-role connection, not a client role.
ALTER TABLE "curriculum"."content_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "curriculum"."courses" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_items_select_published" ON "curriculum"."content_items"
  FOR SELECT TO authenticated
  USING (status = 'published');

CREATE POLICY "courses_select_authenticated" ON "curriculum"."courses"
  FOR SELECT TO authenticated
  USING (true);
