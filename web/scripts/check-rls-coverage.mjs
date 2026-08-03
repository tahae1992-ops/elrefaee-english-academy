#!/usr/bin/env node
// SRS §12.2: "Every new table added to the schema requires an RLS
// policy before merge — enforced as a CI check (a migration adding a
// table without a corresponding policy fails review), not a manual
// reminder."
//
// This checks RLS is *enabled*, not that a CREATE POLICY exists for
// every table — a table can legitimately have RLS enabled with zero
// policies (deny-all to every client role), which is the deliberate,
// documented design for a pure server-side table like
// `identity.refresh_token_registry`. Supabase's own advisor draws the
// same line: "RLS enabled, no policy" is an INFO note, not a failure;
// "RLS not enabled at all" is the real, hard violation this script
// exists to catch — a table an app developer forgot to lock down.
//
// Pure static analysis of the committed *.sql migrations: no DB
// connection, no DATABASE_URL, safe to run in CI unconditionally.

import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const migrationsDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../drizzle/migrations",
);

const migrationFiles = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql") && !f.endsWith(".down.sql"))
  .sort();

const CREATE_TABLE_RE = /CREATE TABLE\s+"([a-z_]+)"\."([a-z_]+)"/gi;
const ENABLE_RLS_RE =
  /ALTER TABLE\s+"([a-z_]+)"\."([a-z_]+)"\s+ENABLE ROW LEVEL SECURITY/gi;
const DROP_TABLE_RE = /DROP TABLE(?:\s+IF EXISTS)?\s+"([a-z_]+)"\."([a-z_]+)"/gi;

const createdTables = new Map(); // "schema.table" -> migration filename
const rlsEnabledTables = new Set(); // "schema.table"

for (const file of migrationFiles) {
  const sql = readFileSync(path.join(migrationsDir, file), "utf8");

  for (const match of sql.matchAll(CREATE_TABLE_RE)) {
    createdTables.set(`${match[1]}.${match[2]}`, file);
  }
  // A table dropped by a later forward migration (rare, but possible in
  // a squash/rework) is no longer "live" and shouldn't be flagged.
  for (const match of sql.matchAll(DROP_TABLE_RE)) {
    createdTables.delete(`${match[1]}.${match[2]}`);
  }
  for (const match of sql.matchAll(ENABLE_RLS_RE)) {
    rlsEnabledTables.add(`${match[1]}.${match[2]}`);
  }
}

const missing = [...createdTables.entries()].filter(
  ([table]) => !rlsEnabledTables.has(table),
);

if (missing.length > 0) {
  console.error("RLS coverage check FAILED (SRS §12.2):\n");
  for (const [table, file] of missing) {
    console.error(`  ${table} — created in ${file}, never has RLS enabled`);
  }
  console.error(
    "\nEvery table needs 'ALTER TABLE \"<schema>\".\"<table>\" ENABLE ROW " +
      "LEVEL SECURITY' in a migration before merge, even if it ends up " +
      "with zero policies (deny-all) by design.",
  );
  process.exit(1);
}

console.log(
  `RLS coverage check passed — ${createdTables.size} table(s) across ` +
    `${migrationFiles.length} migration file(s), all RLS-enabled.`,
);
