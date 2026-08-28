import { readFile, writeFile } from "node:fs/promises";

const decode = (value) => value
  .replace(/<[^>]+>/g, " ")
  .replace(/&mdash;|&#8212;/g, "—")
  .replace(/&amp;/g, "&")
  .replace(/&(?:#39|apos);/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/\s+/g, " ")
  .trim();

const pages = ["site/index.html", "site/privacy/index.html", "site/terms/index.html", "site/404/index.html", "app/index.html", "README.md"];
const source = await Promise.all(pages.map(async (file) => ({ file, content: await readFile(file, "utf8") })));
const blocks = source.flatMap(({ file, content }) => {
  if (file.endsWith(".md")) return content.split(/\n+/).filter((line) => /[A-Za-z]/.test(line) && !line.startsWith("```"))
    .map((line) => ({ file, value: decode(line.replace(/^[-#*]\s*/, "").replace(/`/g, "")) }));
  const text = content;
  const elements = [...text.matchAll(/<(?:h1|h2|h3|p|li|a|button|small|figcaption)(?:\s[^>]*)?>([\s\S]*?)<\/(?:h1|h2|h3|p|li|a|button|small|figcaption)>/gi)].map((match) => decode(match[1]));
  const attributes = [...text.matchAll(/(?:alt|aria-label)="([^"]+)"/gi)].map((match) => decode(match[1]));
  return [...elements, ...attributes].filter(Boolean).map((value) => ({ file, value }));
});
const split = (block) => block.replace(/\b(v?\d+(?:\.\d+){1,3}|\.(?:dmg|exe|msi|zip|wav|json|xml|pdf))\b/gi, (value) => value.replaceAll(".", "§"))
  .split(/(?<=[.!?])\s+/).map((value) => value.replaceAll("§", ".").trim()).filter(Boolean);
const sentences = [...new Map(blocks.flatMap(({ file, value }) => split(value).map((sentence) => [`${file}:${sentence}`, { file, sentence }]))).values()];
const banned = /\b(?:leverage|seamless|effortless|robust|powerful|intuitive|reimagine|supercharge|delightful|journey|ecosystem|AI-powered)\b/i;
const rows = sentences.map(({ file, sentence }) => ({ file, sentence, words: sentence.match(/[\p{L}\p{N}$][\p{L}\p{N}$'’.-]*/gu)?.length || 0 }));
const flags = rows.filter(({ sentence, words }) => words > 22 || banned.test(sentence));
const markdown = [
  "# Landing copy audit",
  "",
  "Generated from all public routes, app copy, image alternatives, and `README.md`. The hard limit is 22 words per sentence.",
  "",
  "| Source | Words | Sentence |",
  "|---|---:|---|",
  ...rows.map(({ file, sentence, words }) => `| ${file} | ${words} | ${sentence.replace(/\|/g, "\\|")} |`),
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
