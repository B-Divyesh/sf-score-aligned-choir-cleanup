import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import { resolve } from "node:path";
import { expect, test } from "vitest";

const execFile = promisify(execFileCallback);

test("copy audit rejects jargon, vague headings, generic actions, marketing words, and terminology drift", async () => {
  await expect(execFile(process.execPath, [
    resolve("scripts/copy-audit.mjs"),
    `--fixture=${resolve("tests/fixtures/copy-audit-bad.txt")}`,
  ])).rejects.toMatchObject({
    stderr: expect.stringMatching(/vague-heading[\s\S]*generic-action[\s\S]*banned-marketing[\s\S]*format-jargon[\s\S]*pack-terminology[\s\S]*score-terminology/),
  });
});
