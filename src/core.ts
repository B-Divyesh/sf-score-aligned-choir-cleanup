export type Passage = { id: string; label: string; start: number; end: number; source?: "score" | "manual" };
export type Cleanup = { preset: "archive" | "clarity" | "hiss"; hum: boolean };

export const PRESETS = {
  archive: { name: "Archive gentle", note: "Rolls off handling rumble; leaves upper detail intact." },
  clarity: { name: "Section clarity", note: "Adds a restrained presence lift for words and entries." },
  hiss: { name: "Hiss restraint", note: "Softens tape hiss above 11 kHz; may reduce some air." },
} as const;

export function formatTime(value: number): string {
  if (!Number.isFinite(value) || value < 0) value = 0;
  const minutes = Math.floor(value / 60);
  const seconds = value - minutes * 60;
  return `${minutes}:${seconds.toFixed(1).padStart(4, "0")}`;
}

export function parseTime(value: string): number | null {
  const clean = value.trim();
  if (/^\d+(\.\d+)?$/.test(clean)) return Number(clean);
  const match = clean.match(/^(\d+):([0-5]?\d(?:\.\d+)?)$/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

export function safeName(value: string): string {
  const clean = value.normalize("NFKD").replace(/[^a-zA-Z0-9._ -]/g, "").trim().replace(/\s+/g, "-");
  return clean.slice(0, 70) || "passage";
}

export function scoreSections(xml: string): { title?: string; labels: string[] } {
  const entity = (s: string) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  const tagText = (tag: string) => [...xml.matchAll(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "gi"))]
    .map((m) => entity(m[1].replace(/<[^>]+>/g, "").trim())).filter(Boolean);
  const title = tagText("work-title")[0] || tagText("movement-title")[0];
  const labels = [...new Set([...tagText("rehearsal"), ...tagText("words").filter((x) => /^(verse|chorus|refrain|coda|intro|section|movement)\b/i.test(x))])];
  return { title, labels: labels.slice(0, 30) };
}

export function receiptText(input: {
  project: string; audio: string; score: string; passages: Passage[]; cleanup: Cleanup; created: string; notes?: string; preparedBy?: string;
}): string {
  const preset = PRESETS[input.cleanup.preset];
  return [
    "CHOIR CLEANUP — EDIT RECEIPT",
    "",
    `Project: ${input.project}`,
    `Created: ${input.created}`,
    `Source audio: ${input.audio}`,
    `Section map: ${input.score}`,
    "Original source modified: No",
    "",
    "Reversible cleanup revision",
    `• ${preset.name}: ${preset.note}`,
    `• Hum notches at 50/60 Hz: ${input.cleanup.hum ? "On" : "Off"}`,
    ...(input.preparedBy ? [`Prepared by: ${input.preparedBy}`] : []),
    ...(input.notes ? [`Project notes: ${input.notes}`] : []),
    "",
    "Exported passages",
    ...input.passages.map((p, index) => `${index + 1}. ${p.label} — ${formatTime(p.start)} to ${formatTime(p.end)}`),
    "",
    "Scope note: This pack is a conservative rehearsal aid, not forensic restoration or isolated voice parts.",
    "Rights confirmed by exporter before generation.",
  ].join("\n");
}

export function encodeWav(buffer: AudioBuffer): Uint8Array {
  const channels = Math.min(buffer.numberOfChannels, 2);
  const frames = buffer.length;
  const out = new ArrayBuffer(44 + frames * channels * 2);
  const view = new DataView(out);
  const ascii = (offset: number, value: string) => [...value].forEach((char, i) => view.setUint8(offset + i, char.charCodeAt(0)));
  ascii(0, "RIFF"); view.setUint32(4, out.byteLength - 8, true); ascii(8, "WAVE"); ascii(12, "fmt ");
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, channels, true);
  view.setUint32(24, buffer.sampleRate, true); view.setUint32(28, buffer.sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true); view.setUint16(34, 16, true); ascii(36, "data");
  view.setUint32(40, frames * channels * 2, true);
  const channelData = Array.from({ length: channels }, (_, i) => buffer.getChannelData(i));
  let offset = 44;
  for (let frame = 0; frame < frames; frame++) for (let channel = 0; channel < channels; channel++) {
    const sample = Math.max(-1, Math.min(1, channelData[channel][frame]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true); offset += 2;
  }
  return new Uint8Array(out);
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const concat = (parts: Uint8Array[]) => {
  const out = new Uint8Array(parts.reduce((sum, item) => sum + item.length, 0));
  let offset = 0; for (const item of parts) { out.set(item, offset); offset += item.length; } return out;
};

export function makeZip(files: { name: string; data: Uint8Array }[]): Uint8Array {
  const encoder = new TextEncoder(); const locals: Uint8Array[] = []; const centrals: Uint8Array[] = []; let position = 0;
  for (const file of files) {
    const name = encoder.encode(file.name); const crc = crc32(file.data);
    const local = new Uint8Array(30 + name.length); const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true); lv.setUint16(6, 0x0800, true);
    lv.setUint32(14, crc, true); lv.setUint32(18, file.data.length, true); lv.setUint32(22, file.data.length, true); lv.setUint16(26, name.length, true); local.set(name, 30);
    const central = new Uint8Array(46 + name.length); const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x0800, true);
    cv.setUint32(16, crc, true); cv.setUint32(20, file.data.length, true); cv.setUint32(24, file.data.length, true); cv.setUint16(28, name.length, true); cv.setUint32(42, position, true); central.set(name, 46);
    locals.push(local, file.data); centrals.push(central); position += local.length + file.data.length;
  }
  const centralBlock = concat(centrals); const end = new Uint8Array(22); const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralBlock.length, true); ev.setUint32(16, position, true);
  return concat([...locals, centralBlock, end]);
}
