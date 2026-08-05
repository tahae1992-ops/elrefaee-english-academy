-- Gamification Engine seed: the badge definition catalog (DB Design
-- §3.7's near-static `engagement.badges` reference table). Chosen as a
-- concrete, achievable set spanning every activity type this platform
-- currently has (lessons, exercises, reviews, XP totals, streaks) —
-- evaluated by badge-evaluator.ts against a learner's live stats
-- snapshot, not hardcoded per feature (SRS FR-18's validation rule).
INSERT INTO "engagement"."badges" ("key", "name", "description", "icon_ref") VALUES
  ('first_lesson', 'First Steps', 'Complete your first lesson.', 'Footprints'),
  ('first_exercise', 'Quick Learner', 'Answer your first exercise correctly.', 'Zap'),
  ('streak_3', 'Getting Warmed Up', 'Reach a 3-day streak.', 'Flame'),
  ('streak_7', 'One Week Strong', 'Reach a 7-day streak.', 'Flame'),
  ('streak_30', 'Habit Formed', 'Reach a 30-day streak.', 'Flame'),
  ('xp_100', 'Century Club', 'Earn 100 XP.', 'Star'),
  ('xp_500', 'Dedicated Learner', 'Earn 500 XP.', 'Trophy'),
  ('reviews_10', 'Memory Builder', 'Complete 10 vocabulary reviews.', 'Brain');
