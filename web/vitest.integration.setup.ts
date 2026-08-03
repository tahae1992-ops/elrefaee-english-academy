import { config } from "dotenv";

// vitest doesn't load .env.local the way Next.js does — load it
// explicitly so DATABASE_URL is available to getDb() in tests.
config({ path: ".env.local" });
