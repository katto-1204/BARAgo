import { cp, rm, stat } from "node:fs/promises";
import { resolve } from "node:path";

const source = resolve("artifacts/public");
const destination = resolve("public");

try {
  const output = await stat(source);
  if (!output.isDirectory()) {
    throw new Error(`${source} is not a directory`);
  }
} catch (error) {
  throw new Error(
    "Expected frontend build output at artifacts/public before preparing Vercel output.",
    { cause: error },
  );
}

await rm(destination, { recursive: true, force: true });
await cp(source, destination, { recursive: true });
