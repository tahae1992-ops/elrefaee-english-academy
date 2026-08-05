DELETE FROM "engagement"."user_badges";
DELETE FROM "engagement"."badges" WHERE "key" IN
  ('first_lesson', 'first_exercise', 'streak_3', 'streak_7', 'streak_30', 'xp_100', 'xp_500', 'reviews_10');
