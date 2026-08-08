import { existsSync, unlinkSync } from "node:fs";
import { FIXTURE_PATH } from "./global-setup";

export default async function globalTeardown() {
  if (existsSync(FIXTURE_PATH)) unlinkSync(FIXTURE_PATH);
}
