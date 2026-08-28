import { readFile } from "node:fs/promises";
import { expect, test } from "vitest";

test("each declared claim has one matching tagged test and a runnable command", async () => {
  const claims = JSON.parse(await readFile(".factory/claims.json", "utf8")) as { id: string; test: string; sandbox: string }[];
  const tests = await Promise.all([
    readFile("tests/e2e/product.spec.ts", "utf8"),
    readFile("tests/unit/release.test.ts", "utf8"),
  ]).then((files) => files.join("\n"));
  expect(new Set(claims.map(({ id }) => id)).size).toBe(claims.length);
  for (const claim of claims) {
    expect(claim.test).toContain(`@claim:${claim.id}`);
    expect(claim.sandbox.trim().length).toBeGreaterThan(20);
    expect(tests.match(new RegExp(`@claim:${claim.id}(?![\\w-])`, "g")) || [], claim.id).toHaveLength(1);
  }
});
