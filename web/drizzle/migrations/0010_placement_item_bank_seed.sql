-- Placement Test item bank seed (DDD §3.9's content, authored per the
-- project's established "Claude generates content, user reviews/
-- approves" workflow — 51 items total: 2 per skill per CEFR level for
-- Grammar/Vocabulary/Reading/Listening (48, all multiple_choice,
-- auto-scored), plus 3 ungraded Speaking prompts (free_text, ungraded
-- at MVP — no audio/pronunciation-scoring infrastructure exists yet).
-- Listening items are delivered via the browser's native Web Speech
-- API (no audio file storage needed) — the "prompt" field is the text
-- to synthesize aloud, not a passage to read.

WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1)
INSERT INTO "assessment"."item_bank" ("academy_id", "skill", "cefr_level", "difficulty", "item_type", "prompt", "scoring_key")
SELECT academy.id, v.skill::"shared"."skill_type", v.cefr_level::"shared"."cefr_level", v.difficulty, v.item_type, v.prompt::jsonb, v.scoring_key::jsonb
FROM academy, (VALUES
  -- Grammar
  ('grammar','pre_a1',1.0,'multiple_choice','{"prompt":"I ___ a student.","options":["am","is","are"]}','{"correctOptionIndex":0}'),
  ('grammar','pre_a1',1.0,'multiple_choice','{"prompt":"She ___ happy.","options":["am","is","are"]}','{"correctOptionIndex":1}'),
  ('grammar','a1',1.5,'multiple_choice','{"prompt":"They ___ to school every day.","options":["go","goes","going"]}','{"correctOptionIndex":0}'),
  ('grammar','a1',1.5,'multiple_choice','{"prompt":"He ___ TV right now.","options":["watch","watches","is watching"]}','{"correctOptionIndex":2}'),
  ('grammar','a2',2.0,'multiple_choice','{"prompt":"I ___ to Paris last year.","options":["go","went","gone"]}','{"correctOptionIndex":1}'),
  ('grammar','a2',2.0,'multiple_choice','{"prompt":"She has ___ her homework.","options":["do","did","done"]}','{"correctOptionIndex":2}'),
  ('grammar','b1',2.75,'multiple_choice','{"prompt":"If it ___ tomorrow, we will stay home.","options":["rain","rains","rained"]}','{"correctOptionIndex":1}'),
  ('grammar','b1',2.75,'multiple_choice','{"prompt":"By next year, I ___ here for a decade.","options":["will work","will have worked","work"]}','{"correctOptionIndex":1}'),
  ('grammar','b2',3.5,'multiple_choice','{"prompt":"I wish I ___ more time to travel.","options":["have","had","had had"]}','{"correctOptionIndex":1}'),
  ('grammar','b2',3.5,'multiple_choice','{"prompt":"Not only ___ he late, but he also forgot the documents.","options":["was","did","he was"]}','{"correctOptionIndex":0}'),
  ('grammar','c1',4.5,'multiple_choice','{"prompt":"Had I known about the traffic, I ___ earlier.","options":["would leave","would have left","left"]}','{"correctOptionIndex":1}'),
  ('grammar','c1',4.5,'multiple_choice','{"prompt":"Rarely ___ such a compelling argument been made.","options":["has","have","had"]}','{"correctOptionIndex":0}'),
  -- Vocabulary
  ('vocabulary','pre_a1',1.0,'multiple_choice','{"prompt":"What color is the sky?","options":["blue","red","green"]}','{"correctOptionIndex":0}'),
  ('vocabulary','pre_a1',1.0,'multiple_choice','{"prompt":"Choose the opposite of ''big''.","options":["small","tall","fast"]}','{"correctOptionIndex":0}'),
  ('vocabulary','a1',1.5,'multiple_choice','{"prompt":"Which word means a place to sleep?","options":["bedroom","kitchen","garden"]}','{"correctOptionIndex":0}'),
  ('vocabulary','a1',1.5,'multiple_choice','{"prompt":"I drink ___ every morning.","options":["coffee","chair","book"]}','{"correctOptionIndex":0}'),
  ('vocabulary','a2',2.0,'multiple_choice','{"prompt":"Which word means ''very tired''?","options":["exhausted","excited","curious"]}','{"correctOptionIndex":0}'),
  ('vocabulary','a2',2.0,'multiple_choice','{"prompt":"''Punctual'' means...","options":["on time","generous","careless"]}','{"correctOptionIndex":0}'),
  ('vocabulary','b1',2.75,'multiple_choice','{"prompt":"''To postpone'' means...","options":["to delay","to cancel","to begin"]}','{"correctOptionIndex":0}'),
  ('vocabulary','b1',2.75,'multiple_choice','{"prompt":"Choose the synonym of ''assist''.","options":["help","avoid","ignore"]}','{"correctOptionIndex":0}'),
  ('vocabulary','b2',3.5,'multiple_choice','{"prompt":"''Meticulous'' most nearly means...","options":["careful and precise","quick and careless","loud"]}','{"correctOptionIndex":0}'),
  ('vocabulary','b2',3.5,'multiple_choice','{"prompt":"''To alleviate'' a problem means to...","options":["reduce it","cause it","ignore it"]}','{"correctOptionIndex":0}'),
  ('vocabulary','c1',4.5,'multiple_choice','{"prompt":"''Ubiquitous'' most nearly means...","options":["present everywhere","very rare","expensive"]}','{"correctOptionIndex":0}'),
  ('vocabulary','c1',4.5,'multiple_choice','{"prompt":"''To corroborate'' a claim means to...","options":["support it with evidence","deny it","exaggerate it"]}','{"correctOptionIndex":0}'),
  -- Reading (prompt.passage is shown, prompt.prompt is the question)
  ('reading','pre_a1',1.0,'multiple_choice','{"passage":"My name is Ana. I am 10 years old.","prompt":"How old is Ana?","options":["10","12","8"]}','{"correctOptionIndex":0}'),
  ('reading','pre_a1',1.0,'multiple_choice','{"passage":"This is a cat. The cat is black.","prompt":"What color is the cat?","options":["black","white","brown"]}','{"correctOptionIndex":0}'),
  ('reading','a1',1.5,'multiple_choice','{"passage":"Tom works in a shop. He starts at 9am and finishes at 5pm.","prompt":"What time does Tom finish work?","options":["5pm","9am","6pm"]}','{"correctOptionIndex":0}'),
  ('reading','a1',1.5,'multiple_choice','{"passage":"Maria likes tea, not coffee.","prompt":"What does Maria like?","options":["tea","coffee","juice"]}','{"correctOptionIndex":0}'),
  ('reading','a2',2.0,'multiple_choice','{"passage":"Last weekend, Sam went hiking with friends. It rained, so they came home early.","prompt":"Why did they come home early?","options":["it rained","they were tired","it got dark"]}','{"correctOptionIndex":0}'),
  ('reading','a2',2.0,'multiple_choice','{"passage":"The museum is closed on Mondays but open every other day.","prompt":"When is the museum closed?","options":["Monday","Sunday","Friday"]}','{"correctOptionIndex":0}'),
  ('reading','b1',2.75,'multiple_choice','{"passage":"Remote work has become common. While some enjoy the flexibility, others miss the social contact of an office.","prompt":"What do some people miss about the office?","options":["social contact","the commute","the salary"]}','{"correctOptionIndex":0}'),
  ('reading','b1',2.75,'multiple_choice','{"passage":"The new policy aims to reduce traffic by encouraging cycling, though critics say more bike lanes are needed first.","prompt":"What do critics say is needed?","options":["more bike lanes","more cars","higher taxes"]}','{"correctOptionIndex":0}'),
  ('reading','b2',3.5,'multiple_choice','{"passage":"Although the study''s sample size was small, its findings suggest a meaningful link between sleep and memory, prompting calls for larger-scale research.","prompt":"What do the findings suggest?","options":["a link between sleep and memory","a cure for insomnia","no connection at all"]}','{"correctOptionIndex":0}'),
  ('reading','b2',3.5,'multiple_choice','{"passage":"Critics argue the merger will reduce competition, while supporters claim it will lower costs for consumers through efficiency.","prompt":"What do supporters claim?","options":["lower costs through efficiency","more competition","higher prices"]}','{"correctOptionIndex":0}'),
  ('reading','c1',4.5,'multiple_choice','{"passage":"The report''s conclusions, while methodologically sound, rest on assumptions that later data have called into question, underscoring the provisional nature of early-stage research.","prompt":"What does the passage suggest about the report''s conclusions?","options":["they may need revision in light of new data","they are definitively proven","they were dismissed entirely"]}','{"correctOptionIndex":0}'),
  ('reading','c1',4.5,'multiple_choice','{"passage":"Far from resolving the debate, the ruling merely postponed a reckoning that legal scholars now consider inevitable.","prompt":"According to the passage, the ruling...","options":["delayed rather than settled the issue","ended the debate permanently","was welcomed by all scholars"]}','{"correctOptionIndex":0}'),
  -- Listening (prompt.audioText is synthesized aloud via Web Speech API)
  ('listening','pre_a1',1.0,'multiple_choice','{"audioText":"Hello. My name is Leo.","prompt":"What is the speaker''s name?","options":["Leo","Ana","Sam"]}','{"correctOptionIndex":0}'),
  ('listening','pre_a1',1.0,'multiple_choice','{"audioText":"The ball is red.","prompt":"What color is the ball?","options":["red","blue","green"]}','{"correctOptionIndex":0}'),
  ('listening','a1',1.5,'multiple_choice','{"audioText":"I have two brothers and one sister.","prompt":"How many brothers does the speaker have?","options":["two","one","three"]}','{"correctOptionIndex":0}'),
  ('listening','a1',1.5,'multiple_choice','{"audioText":"We eat breakfast at eight o''clock.","prompt":"What time do they eat breakfast?","options":["eight o''clock","seven o''clock","nine o''clock"]}','{"correctOptionIndex":0}'),
  ('listening','a2',2.0,'multiple_choice','{"audioText":"I usually take the bus to work, but today I walked because it was sunny.","prompt":"Why did the speaker walk today?","options":["it was sunny","the bus was late","they wanted exercise"]}','{"correctOptionIndex":0}'),
  ('listening','a2',2.0,'multiple_choice','{"audioText":"The store closes early on Sundays, at four in the afternoon.","prompt":"When does the store close on Sundays?","options":["four in the afternoon","four in the morning","five in the afternoon"]}','{"correctOptionIndex":0}'),
  ('listening','b1',2.75,'multiple_choice','{"audioText":"Even though the flight was delayed by two hours, we still arrived in time for the meeting.","prompt":"What happened to the flight?","options":["it was delayed","it was cancelled","it left early"]}','{"correctOptionIndex":0}'),
  ('listening','b1',2.75,'multiple_choice','{"audioText":"She decided to switch careers after realizing her old job left no time for her family.","prompt":"Why did she switch careers?","options":["her old job left no time for family","she was fired","she wanted more money"]}','{"correctOptionIndex":0}'),
  ('listening','b2',3.5,'multiple_choice','{"audioText":"Despite initial skepticism from investors, the startup secured funding after demonstrating strong early user growth.","prompt":"Why did the startup secure funding?","options":["it showed strong early user growth","investors were not skeptical at all","it had no competitors"]}','{"correctOptionIndex":0}'),
  ('listening','b2',3.5,'multiple_choice','{"audioText":"The committee postponed the vote, citing the need for further consultation with affected communities.","prompt":"Why was the vote postponed?","options":["the need for further consultation","lack of interest","a scheduling conflict only"]}','{"correctOptionIndex":0}'),
  ('listening','c1',4.5,'multiple_choice','{"audioText":"The negotiations, though fraught with setbacks, ultimately yielded a compromise neither side considered ideal but both deemed workable.","prompt":"How did the negotiations end?","options":["with a workable compromise","with total failure","with one side winning completely"]}','{"correctOptionIndex":0}'),
  ('listening','c1',4.5,'multiple_choice','{"audioText":"What began as a routine audit gradually revealed discrepancies serious enough to prompt a full external investigation.","prompt":"What did the audit lead to?","options":["a full external investigation","no further action","an immediate resolution"]}','{"correctOptionIndex":0}')
) AS v(skill, cefr_level, difficulty, item_type, prompt, scoring_key);

-- Speaking: 3 ungraded free-text prompts, one per broad tier (not one
-- per exact CEFR level — there's no auto-scoring for these, they're
-- for future human/AI review, so finer granularity isn't useful yet).
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1)
INSERT INTO "assessment"."item_bank" ("academy_id", "skill", "cefr_level", "difficulty", "item_type", "prompt", "scoring_key")
SELECT academy.id, 'speaking'::"shared"."skill_type", v.cefr_level::"shared"."cefr_level", v.difficulty, 'free_text', v.prompt::jsonb, NULL
FROM academy, (VALUES
  ('a1', 1.5, '{"prompt":"Describe your family in a few sentences."}'),
  ('b1', 2.75, '{"prompt":"Describe a memorable trip you took. What made it special?"}'),
  ('c1', 4.5, '{"prompt":"Do you think technology has made communication better or worse? Explain your view with examples."}')
) AS v(cefr_level, difficulty, prompt);

-- The one placement blueprint this slice needs.
WITH academy AS (SELECT id FROM "academy"."academies" LIMIT 1)
INSERT INTO "assessment"."test_blueprints" ("academy_id", "key", "rules")
SELECT academy.id, 'placement', '{
  "itemsPerSkillPerTier": 2,
  "tiersAroundSelfAssessment": 1,
  "passThresholdPercent": 70,
  "gradedSkills": ["grammar", "vocabulary", "reading", "listening"]
}'::jsonb
FROM academy;
