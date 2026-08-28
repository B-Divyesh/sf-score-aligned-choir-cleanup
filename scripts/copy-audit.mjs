import { readFile, writeFile } from "node:fs/promises";

const decode = (value) => value
  .replace(/<[^>]+>/g, " ")
  .replace(/&mdash;|&#8212;/g, "—")
  .replace(/&amp;/g, "&")
  .replace(/&(?:#39|apos);/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/\s+/g, " ")
  .trim();

const wordCount = (value) => value.match(/[\p{L}\p{N}$][\p{L}\p{N}$'’.-]*/gu)?.length || 0;
const split = (block) => block.replace(/\b(v?\d+(?:\.\d+){1,3}|\.(?:dmg|exe|msi|zip|wav|json|xml|pdf|deb))\b/gi, (value) => value.replaceAll(".", "§"))
  .split(/(?<=[.!?])\s+/).map((value) => value.replaceAll("§", ".").trim()).filter(Boolean);

const styleRules = [
  { id: "banned-marketing", pattern: /\b(?:leverage|seamless|effortless|robust|powerful|intuitive|reimagine|supercharge|delightful|journey|ecosystem|AI-powered|complete)\b/i, reason: "banned or vague marketing word" },
  { id: "format-jargon", pattern: /\bPCM\b|operating system WebView|machine-readable|\bSHA256\b/i, reason: "unexplained implementation or file-format jargon" },
  { id: "vague-heading", pattern: /^(?:What v\d+ includes|A clear boundary|A conservator[’']s workflow|Useful restraint, measured in three passes)[.!?]?$/i, reason: "heading does not explain its section alone" },
  { id: "generic-action", pattern: /^(?:View downloads|Get the desktop app|Copy|Close|Submit|Continue|Go)[.!?]?$/i, reason: "control does not name its result" },
  { id: "pack-terminology", pattern: /\brehearsal cop(?:y|ies)\b|\bpractice excerpts?\b|\bdownload folder\b/i, reason: "use rehearsal pack for the collection and WAV excerpt for each audio file" },
  { id: "score-terminology", pattern: /\b(?:score map|section map|rehearsal marks?)\b/i, reason: "use score reference for the file and score mark for a cue" },
];

function auditRows(rows) {
  const flags = [];
  for (const row of rows) {
    if (row.words > 22) flags.push({ ...row, rule: "sentence-length", reason: "sentence exceeds 22 words" });
    for (const rule of styleRules) if (rule.pattern.test(row.sentence)) flags.push({ ...row, rule: rule.id, reason: rule.reason });
  }
  return flags;
}

const fixtureArg = process.argv.find((value) => value.startsWith("--fixture="));
if (fixtureArg) {
  const fixturePath = fixtureArg.slice("--fixture=".length);
  const fixture = await readFile(fixturePath, "utf8");
  const rows = split(decode(fixture)).map((sentence) => ({ file: fixturePath, sentence, words: wordCount(sentence) }));
  const flags = auditRows(rows);
  if (!flags.length) process.exitCode = 2;
  else {
    console.error(flags.map(({ rule, sentence }) => `${rule}: ${sentence}`).join("\n"));
    process.exitCode = 1;
  }
} else {
  const pages = ["site/index.html", "site/privacy/index.html", "site/terms/index.html", "site/404/index.html", "app/index.html", "README.md"];
  const dynamicFiles = ["site/main.ts", "app/main.ts"];
  const source = await Promise.all(pages.map(async (file) => ({ file, content: await readFile(file, "utf8") })));
  const blocks = source.flatMap(({ file, content }) => {
    if (file.endsWith(".md")) return content.split(/\n+/).filter((line) => /[A-Za-z]/.test(line) && !line.startsWith("```") && !line.startsWith("|") && !/^\s*[a-z]+:\/\//i.test(line))
      .map((line) => ({ file, value: decode(line.replace(/^[-#*]\s*/, "").replace(/`/g, "")), kind: /^#+\s/.test(line) ? "heading" : "text" }));
    const elements = [...content.matchAll(/<(h1|h2|h3|p|li|a|button|small|figcaption)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)]
      .map((match) => ({ file, value: decode(match[2]), kind: ["h1", "h2", "h3"].includes(match[1].toLowerCase()) ? "heading" : match[1].toLowerCase() === "button" ? "button" : "text" }));
    const attributes = [...content.matchAll(/(?:alt|aria-label)="([^"]+)"/gi)].map((match) => ({ file, value: decode(match[1]), kind: "alternative" }));
    return [...elements, ...attributes].filter(({ value }) => Boolean(value));
  });
  for (const file of dynamicFiles) {
    const content = await readFile(file, "utf8");
    for (const match of content.matchAll(/(?:"([^"\n]{3,})"|'([^'\n]{3,})'|`([^`\n]{3,})`)/g)) {
      const value = decode(match[1] || match[2] || match[3] || "");
      if (!/[A-Za-z]/.test(value) || /^(?:[#./]|https?:|[a-z-]+:)/i.test(value) || /[{}][.#\w]+/.test(value)) continue;
      if (!/\s/.test(value) && !/[.!?…]/.test(value)) continue;
      blocks.push({ file, value, kind: "conditional" });
    }
  }
  const rows = [...new Map(blocks.flatMap(({ file, value, kind }) => split(value).map((sentence) => [`${file}:${kind}:${sentence}`, { file, kind, sentence, words: wordCount(sentence) }]))).values()];
  const flags = auditRows(rows);
  const landing = source.find(({ file }) => file === "site/index.html")?.content || "";
  const headline = decode(landing.match(/<h1>([\s\S]*?)<\/h1>/i)?.[1] || "");
  const lede = decode(landing.match(/<p class="lede">([\s\S]*?)<\/p>/i)?.[1] || "");
  if (wordCount(headline) > 9 || !/^(?:Make|Turn|Create|Build|Export|Mark|Clean)\b/i.test(headline)) flags.push({ file: "site/index.html", kind: "headline", sentence: headline, words: wordCount(headline), rule: "first-screen-headline", reason: "headline must start with a job verb and use at most nine words" });
  if (wordCount(lede) > 22 || !/\bfor\b/i.test(lede)) flags.push({ file: "site/index.html", kind: "lede", sentence: lede, words: wordCount(lede), rule: "first-screen-lede", reason: "lede must name its audience in at most 22 words" });

  const markdown = [
    "# Landing copy audit",
    "",
    "Generated from every public route, app copy, dynamic UI string, image alternative, ARIA label, and `README.md`.",
    "",
    "Checks: 22-word sentence cap, first-screen shape, banned marketing, jargon, standalone headings, action labels, and fixed terminology.",
    "",
    "| Source | Kind | Words | Sentence |",
    "|---|---|---:|---|",
    ...rows.map(({ file, kind, sentence, words }) => `| ${file} | ${kind} | ${words} | ${sentence.replace(/\|/g, "\\|")} |`),
    "",
    "## Flags",
    "",
    flags.length ? flags.map(({ file, rule, reason, sentence }) => `- ${file} · ${rule}: ${reason} — ${sentence}`).join("\n") : "None.",
    "",
    "## Terminology",
    "",
    "| Concept | One term |",
    "|---|---|",
    "| Bundled try-out | sample project |",
    "| Source subdivision | passage |",
    "| Exported collection | rehearsal pack |",
    "| Exported audio file | WAV excerpt |",
    "| Processing choice | cleanup |",
    "| Paid option | Steward license |",
    "| Imported structural file | score reference |",
    "| Structural score cue | score mark |",
    "",
  ].join("\n");

  if (process.argv.includes("--write")) await writeFile(".factory/copy-audit.md", markdown);
  if (flags.length) {
    console.error(flags.map(({ file, rule, sentence }) => `${file} [${rule}]: ${sentence}`).join("\n"));
    process.exit(1);
  }
  console.log(`Copy audit passed: ${rows.length} strings; sentence, first-screen, jargon, heading, action, and terminology checks are clean.`);
}
