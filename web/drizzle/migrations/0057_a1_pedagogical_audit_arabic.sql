-- A1 pedagogical/media audit, Part 1: Arabic scaffolding for the 5
-- pre-existing A1 lessons (Meeting People, Talking About Yourself,
-- Family and Friends, My Day, Likes and Dislikes -- authored in Phase
-- 21, before any Arabic-support columns/fields existed in this
-- project). Ground-truth audit found these 5 lessons' 27 vocabulary
-- entries and 5 presentation blocks carried ZERO Arabic anywhere --
-- a real gap for a learner's very first A1 lessons, not a deliberate
-- reduced-Arabic choice (that policy only applies to the 11
-- newly-authored lessons, which already have explanationAr on their
-- grammar points).
--
-- Every translation below is a real, meaning-accurate Arabic
-- translation of the headword/grammar point, not a placeholder.

UPDATE curriculum.vocabulary_entries SET arabic_translation = v.arabic
FROM (VALUES
  ('hello', 'مرحباً'),
  ('hi', 'أهلاً'),
  ('my name is', 'اسمي'),
  ('nice to meet you', 'تشرفت بمعرفتك'),
  ('what''s your name', 'ما اسمك؟'),
  ('I am', 'أنا'),
  ('she is', 'هي'),
  ('they are', 'هم'),
  ('live in', 'يعيش في'),
  ('from', 'من'),
  ('brother', 'أخ'),
  ('sister', 'أخت'),
  ('parents', 'الوالدان'),
  ('friend', 'صديق'),
  ('kind', 'لطيف'),
  ('funny', 'مضحك'),
  ('wake up', 'يستيقظ'),
  ('go to work', 'يذهب إلى العمل'),
  ('have breakfast', 'يتناول الفطور'),
  ('in the morning', 'في الصباح'),
  ('at night', 'في الليل'),
  ('love', 'يحب كثيراً'),
  ('hate', 'يكره'),
  ('swimming', 'السباحة'),
  ('reading', 'القراءة'),
  ('cooking', 'الطبخ')
) AS v(headword, arabic)
WHERE vocabulary_entries.cefr_level = 'a1' AND vocabulary_entries.headword = v.headword;

-- 'like' collides with the a1 sense_number=2 row (I Like / I Don't
-- Like) -- target sense_number=1 (Daily Routines' like+-ing) explicitly.
UPDATE curriculum.vocabulary_entries SET arabic_translation = 'يحب'
WHERE cefr_level = 'a1' AND headword = 'like' AND sense_number = 1;

-- Presentation-block explanationAr for the 5 pre-existing lessons.
UPDATE curriculum.content_items
SET payload = jsonb_set(payload, '{blocks,1,explanationAr}', '"Hello/Hi للتحية. My name is... أو I''m... للتعريف بنفسك. What''s your name؟ للسؤال عن اسم الشخص."')
WHERE id = 'e727403d-6b07-4be0-9958-651f6e697dd9' AND payload->'blocks'->1->>'type' = 'presentation';

UPDATE curriculum.content_items
SET payload = jsonb_set(payload, '{blocks,1,explanationAr}', '"نستخدم am/is/are مع فعل الكينونة: I am، she/he/it is، they/we/you are. نستخدم live in لذكر المدينة التي تعيش فيها."')
WHERE id = '8ae9d096-bd3d-4ce7-ba23-886ac3c284ef' AND payload->'blocks'->1->>'type' = 'presentation';

UPDATE curriculum.content_items
SET payload = jsonb_set(payload, '{blocks,1,explanationAr}', '"نستخدم صفات الملكية my/your/his/her/our/their لبيان ملكية الشيء. نستخدم صفات بسيطة مثل kind وfunny لوصف الأشخاص."')
WHERE id = '674c22b7-9014-4b51-9a5f-99068d8d0299' AND payload->'blocks'->1->>'type' = 'presentation';

UPDATE curriculum.content_items
SET payload = jsonb_set(payload, '{blocks,1,explanationAr}', '"نستخدم المضارع البسيط للعادات اليومية، ونضيف -s مع he/she/it. تعبيرات الوقت: in the morning، at night، at 7 o''clock."')
WHERE id = '8b64b5b4-ba56-4afe-9e0c-89bfcff4f99e' AND payload->'blocks'->1->>'type' = 'presentation';

UPDATE curriculum.content_items
SET payload = jsonb_set(payload, '{blocks,1,explanationAr}', '"نستخدم like/love/hate + الفعل مع -ing للتعبير عن التفضيلات: I like reading."')
WHERE id = '1a7848e3-76eb-4011-be34-3a85c830e210' AND payload->'blocks'->1->>'type' = 'presentation';
