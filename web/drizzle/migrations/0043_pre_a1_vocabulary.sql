-- Pre-A1 curriculum, Phase 3: the vocabulary bank -- real
-- `curriculum.vocabulary_entries` rows with `arabic_translation`
-- populated (Pre-A1 blueprint Rev. 3 Rule 2 / Template 0 step 4),
-- referenced by id from 0044's lesson block content.
--
-- Four headwords already exist as A1 vocabulary (hello, hi, brother,
-- sister, from -- seeded in 0022_vocabulary_entries_seed.sql) and are
-- deliberately given sense_number=2 here rather than reused, so this
-- migration never touches existing A1 rows (the user's explicit "do
-- not modify A1+ content yet" instruction) -- spiral recurrence with
-- its own Pre-A1-appropriate examples/collocations, not a duplicate.

WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1)
INSERT INTO "curriculum"."content_items" ("academy_id", "type", "cefr_level", "status", "payload")
SELECT academy.id, 'vocabulary_entry'::"shared"."content_type", 'pre_a1'::"shared"."cefr_level", 'published'::"shared"."content_status", jsonb_build_object('title', v.headword)
FROM academy, (VALUES
  ('cat'), ('dog'), ('sun'), ('pen'),
  ('hello'), ('hi'), ('good morning'), ('good night'), ('goodbye'), ('bye'),
  ('zero'), ('one'), ('two'), ('three'), ('four'), ('five'), ('six'), ('seven'), ('eight'), ('nine'), ('ten'),
  ('please repeat'), ('please speak slowly'), ('I don''t understand'), ('please help me'),
  ('name'), ('age'), ('years old'),
  ('this'), ('that'), ('my'), ('your'),
  ('mother'), ('father'), ('brother'), ('sister'), ('family'),
  ('country'), ('from'), ('Egypt'),
  ('red'), ('blue'), ('green'), ('yellow'), ('book'),
  ('bag'), ('phone'), ('key'),
  ('Monday'), ('Tuesday'), ('Wednesday'), ('Thursday'), ('Friday'), ('Saturday'), ('Sunday'), ('today'), ('tomorrow'),
  ('table'), ('box'), ('chair'),
  ('clock'), ('o''clock')
) AS v(headword);

WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1)
INSERT INTO "curriculum"."vocabulary_entries"
  ("content_item_id", "academy_id", "headword", "sense_number", "ipa_transcription", "part_of_speech", "cefr_level", "tier", "collocations", "synonyms", "example_sentences", "arabic_translation")
SELECT ci.id, academy.id, v.headword, v.sense_number, v.ipa, v.part_of_speech, 'pre_a1'::"shared"."cefr_level", v.tier,
  v.collocations::text[], v.synonyms::text[], v.example_sentences::jsonb, v.arabic
FROM academy, "curriculum"."content_items" ci
JOIN (VALUES
  ('cat', 1, '/kaet/', 'noun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"I see a cat."}]', 'قطة'),
  ('dog', 1, '/dawg/', 'noun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"The dog is big."}]', 'كلب'),
  ('sun', 1, '/sUHn/', 'noun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"The sun is hot."}]', 'شمس'),
  ('pen', 1, '/pen/', 'noun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"I have a pen."}]', 'قلم'),

  ('hello', 2, '/heh-LOH/', 'interjection', 'active', ARRAY[]::text[], ARRAY['hi']::text[], '[{"text":"Hello! How are you?"}]', 'مرحبًا'),
  ('hi', 2, '/hy/', 'interjection', 'active', ARRAY[]::text[], ARRAY['hello']::text[], '[{"text":"Hi! My name is Omar."}]', 'أهلاً'),
  ('good morning', 1, '/good MOR-ning/', 'phrase', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"Good morning, teacher!"}]', 'صباح الخير'),
  ('good night', 1, '/good nyt/', 'phrase', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"Good night, see you tomorrow."}]', 'تصبح على خير'),
  ('goodbye', 1, '/good-BY/', 'interjection', 'active', ARRAY[]::text[], ARRAY['bye']::text[], '[{"text":"Goodbye! See you soon."}]', 'مع السلامة'),
  ('bye', 1, '/by/', 'interjection', 'active', ARRAY[]::text[], ARRAY['goodbye']::text[], '[{"text":"Bye! Have a good day."}]', 'باي'),

  ('zero', 1, '/ZEER-oh/', 'number', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"Zero means nothing, 0."}]', 'صفر'),
  ('one', 1, '/wUHn/', 'number', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"I have one book."}]', 'واحد'),
  ('two', 1, '/too/', 'number', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"I have two pens."}]', 'اثنان'),
  ('three', 1, '/three/', 'number', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"I see three cats."}]', 'ثلاثة'),
  ('four', 1, '/for/', 'number', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"There are four days left."}]', 'أربعة'),
  ('five', 1, '/fyv/', 'number', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"I have five fingers on one hand."}]', 'خمسة'),
  ('six', 1, '/siks/', 'number', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"The class starts at six."}]', 'ستة'),
  ('seven', 1, '/SEH-vuhn/', 'number', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"There are seven days in a week."}]', 'سبعة'),
  ('eight', 1, '/eyt/', 'number', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"I wake up at eight."}]', 'ثمانية'),
  ('nine', 1, '/nyn/', 'number', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"Nine is one less than ten."}]', 'تسعة'),
  ('ten', 1, '/ten/', 'number', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"Count to ten."}]', 'عشرة'),

  ('please repeat', 1, '/pleez ri-PEET/', 'phrase', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"Please repeat that."}]', 'من فضلك كرر'),
  ('please speak slowly', 1, '/pleez speek SLOH-lee/', 'phrase', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"Please speak slowly, I am learning."}]', 'من فضلك تكلم ببطء'),
  ('I don''t understand', 1, '/ay dohnt UHN-der-stand/', 'phrase', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"Sorry, I don''t understand."}]', 'أنا لا أفهم'),
  ('please help me', 1, '/pleez help mee/', 'phrase', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"Excuse me, please help me."}]', 'من فضلك ساعدني'),

  ('name', 1, '/neym/', 'noun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"My name is Layla."}]', 'اسم'),
  ('age', 1, '/eyj/', 'noun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"What is your age?"}]', 'عمر'),
  ('years old', 1, '/yeerz ohld/', 'phrase', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"I am 20 years old."}]', 'سنة (للعمر)'),

  ('this', 1, '/dhis/', 'pronoun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"This is my book."}]', 'هذا'),
  ('that', 1, '/dhat/', 'pronoun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"That is your pen."}]', 'ذلك'),
  ('my', 1, '/my/', 'pronoun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"This is my bag."}]', 'ملكي'),
  ('your', 1, '/yor/', 'pronoun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"Is that your book?"}]', 'ملكك'),

  ('mother', 1, '/MUH-dher/', 'noun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"My mother is kind."}]', 'أم'),
  ('father', 1, '/FAH-dher/', 'noun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"My father works hard."}]', 'أب'),
  ('brother', 2, '/BRUH-dher/', 'noun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"My brother is 10 years old."}]', 'أخ'),
  ('sister', 2, '/SIS-ter/', 'noun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"My sister likes to read."}]', 'أخت'),
  ('family', 1, '/FAM-uh-lee/', 'noun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"I love my family."}]', 'عائلة'),

  ('country', 1, '/KUHN-tree/', 'noun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"Egypt is my country."}]', 'بلد'),
  ('from', 2, '/fruhm/', 'preposition', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"I am from Egypt."}]', 'من'),
  ('Egypt', 1, '/EE-jipt/', 'proper noun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"I am from Egypt."}]', 'مصر'),

  ('red', 1, '/red/', 'adjective', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"The apple is red."}]', 'أحمر'),
  ('blue', 1, '/bloo/', 'adjective', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"The sky is blue."}]', 'أزرق'),
  ('green', 1, '/green/', 'adjective', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"The grass is green."}]', 'أخضر'),
  ('yellow', 1, '/YEH-loh/', 'adjective', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"The sun is yellow."}]', 'أصفر'),
  ('book', 1, '/book/', 'noun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"I am reading a book."}]', 'كتاب'),

  ('bag', 1, '/bag/', 'noun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"My bag is heavy."}]', 'حقيبة'),
  ('phone', 1, '/fohn/', 'noun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"I have a phone in my bag."}]', 'هاتف'),
  ('key', 1, '/kee/', 'noun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"I need my key."}]', 'مفتاح'),

  ('Monday', 1, '/MUHN-day/', 'noun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"School starts on Monday."}]', 'الإثنين'),
  ('Tuesday', 1, '/TOOZ-day/', 'noun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"I have class on Tuesday."}]', 'الثلاثاء'),
  ('Wednesday', 1, '/WENZ-day/', 'noun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"Today is Wednesday."}]', 'الأربعاء'),
  ('Thursday', 1, '/THURZ-day/', 'noun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"See you on Thursday."}]', 'الخميس'),
  ('Friday', 1, '/FRY-day/', 'noun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"Friday is a rest day."}]', 'الجمعة'),
  ('Saturday', 1, '/SAT-er-day/', 'noun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"We meet on Saturday."}]', 'السبت'),
  ('Sunday', 1, '/SUHN-day/', 'noun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"Sunday is the first day of the week here."}]', 'الأحد'),
  ('today', 1, '/tuh-DAY/', 'adverb', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"Today is a good day."}]', 'اليوم'),
  ('tomorrow', 1, '/tuh-MOR-oh/', 'adverb', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"See you tomorrow."}]', 'غدًا'),

  ('table', 1, '/TAY-buhl/', 'noun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"The book is on the table."}]', 'طاولة'),
  ('box', 1, '/boks/', 'noun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"The pen is in the box."}]', 'صندوق'),
  ('chair', 1, '/chair/', 'noun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"Sit on the chair."}]', 'كرسي'),

  ('clock', 1, '/klok/', 'noun', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"Look at the clock."}]', 'ساعة (حائط)'),
  ('o''clock', 1, '/uh-KLOK/', 'phrase', 'active', ARRAY[]::text[], ARRAY[]::text[], '[{"text":"It is three o''clock."}]', 'بالضبط (للساعة)')
) AS v(headword, sense_number, ipa, part_of_speech, tier, collocations, synonyms, example_sentences, arabic)
ON ci.payload->>'title' = v.headword
WHERE ci.type = 'vocabulary_entry' AND ci.academy_id = academy.id AND ci.cefr_level = 'pre_a1'::"shared"."cefr_level";
