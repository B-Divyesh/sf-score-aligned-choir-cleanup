import { readFile, writeFile } from "node:fs/promises";

const html = await readFile("site/index.html", "utf8");
const decode = (value) => value
  .replace(/<[^>]+>/g, " ")
  .replace(/&mdash;|&#8212;/g, "—")
  .replace(/&amp;/g, "&")
  .replace(/&(?:#39|apos);/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/\s+/g, " ")
  .trim();

const blocks = [...html.matchAll(/<(?:h1|h2|h3|p|li|a|button)(?:\s[^>]*)?>([\s\S]*?)<\/(?:h1|h2|h3|p|li|a|button)>/gi)]
  .map((match) => decode(match[1]))
  .filter(Boolean);
const sentences = [...new Set(blocks.flatMap((block) => block.match(/[^.!?]+[.!?]?/g) || []).map((sentence) => sentence.trim()).filter(Boolean))];
const banned = /\b(?:leverage|seamless|effortless|robust|powerful|intuitive|reimagine|supercharge|delightful|journey|ecosystem|AI-powered)\b/i;
const rows = sentences.map((sentence) => ({ sentence, words: sentence.match(/[\p{L}\p{N}$][\p{L}\p{N}$'’.-]*/gu)?.length || 0 }));
const flags = rows.filter(({ sentence, words }) => words > 22 || banned.test(sentence));
const markdown = [
  "# Landing copy audit",
  "",
  "Generated from `site/index.html`. The hard limit is 22 words per sentence.",
  "",
  "| Words | Sentence |",
  "|---:|---|",
  ...rows.map(({ sentence, words }) => `| ${words} | ${sentence.replace(/\|/g, "\\|")} |`),
  "",
  "## Flags",
  "",
  flags.length ? flags.map(({ sentence, words }) => `- ${words} words: ${sentence}`).join("\n") : "None.",
  "",
  "## Terminology",
  "",
  "| Concept | One term |",
  "|---|---|",
  "| Bundled try-out | sample project |",
  "| Source subdivision | passage |",
  "| Exported collection | pack |",
  "| Processing choice | cleanup |",
  "| Paid option | Steward license |",
  "| Structural score cue | score mark |",
  "",
].join("\n");

if (process.argv.includes("--write")) await writeFile(".factory/copy-audit.md", markdown);
if (flags.length) {
  console.error(flags.map(({ sentence, words }) => `${words}: ${sentence}`).join("\n"));
  process.exit(1);
}
console.log(`Copy audit passed: ${rows.length} sentences, no banned terms or sentences over 22 words.`);
