import { writeFileSync } from "node:fs";
import path from "node:path";
import { getTestDb, closeTestDb } from "./db";

export interface E2eFixtureData {
  a1CourseId: string;
  a1Units: { id: string; lessonIds: string[]; checkpointBlueprintId: string }[];
}

const FIXTURE_PATH = path.join(import.meta.dirname, ".fixture-data.json");

/**
 * Resolves the seeded a1 course's structure by content, not by
 * hardcoding UUIDs into spec files (which would silently drift from
 * reality the moment seed data changes). Writes the result to a JSON
 * file the specs read, since Playwright's globalSetup runs in its
 * own process and can't hand values directly to test files.
 */
export default async function globalSetup() {
  const sql = getTestDb();

  const [course] = await sql<{ id: string }[]>`
    select id from curriculum.courses where cefr_level = 'a1' limit 1
  `;
  if (!course) throw new Error("E2E fixture setup: no a1 course found -- has the curriculum seed migration been applied?");

  const units = await sql<{ id: string; order_index: number }[]>`
    select id, order_index from curriculum.units where course_id = ${course.id} order by order_index
  `;

  const a1Units: E2eFixtureData["a1Units"] = [];
  for (const unit of units) {
    const lessons = await sql<{ id: string }[]>`
      select id from curriculum.lessons where unit_id = ${unit.id} order by order_index
    `;
    const [checkpoint] = await sql<{ id: string }[]>`
      select id from assessment.test_blueprints where unit_id = ${unit.id} and kind = 'unit_checkpoint' limit 1
    `;
    if (!checkpoint) throw new Error(`E2E fixture setup: unit ${unit.id} has no checkpoint blueprint.`);
    a1Units.push({ id: unit.id, lessonIds: lessons.map((l) => l.id), checkpointBlueprintId: checkpoint.id });
  }

  const data: E2eFixtureData = { a1CourseId: course.id, a1Units };
  writeFileSync(FIXTURE_PATH, JSON.stringify(data, null, 2));

  await closeTestDb();
}

export { FIXTURE_PATH };
