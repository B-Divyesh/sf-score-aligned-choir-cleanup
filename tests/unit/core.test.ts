import { describe, expect, it } from "vitest";
import { formatTime, makeZip, parseTime, receiptText, safeName, scoreSections } from "../../src/core";

describe("timecodes", () => {
  it("formats and parses rehearsal timecodes", () => {
    expect(formatTime(65.25)).toBe("1:05.3");
    expect(parseTime("1:05.3")).toBeCloseTo(65.3);
    expect(parseTime("72.5")).toBe(72.5);
    expect(parseTime("1:72")).toBeNull();
  });
});

describe("score structure", () => {
  it("extracts title and unique rehearsal marks from MusicXML", () => {
    const xml = `<score-partwise><work><work-title>Winter &amp; Spring</work-title></work><direction><direction-type><rehearsal>A</rehearsal></direction-type></direction><direction><direction-type><rehearsal>A</rehearsal><words>Chorus 2</words></direction-type></direction></score-partwise>`;
    expect(scoreSections(xml)).toEqual({ title: "Winter & Spring", labels: ["A", "Chorus 2"] });
  });
});

describe("export records", () => {
  it("makes safe names, transparent receipts, and a valid ZIP envelope", () => {
    expect(safeName("  Kyrie / rehearsal #2  ")).toBe("Kyrie-rehearsal-2");
    const receipt = receiptText({ project: "Kyrie", audio: "tape.wav", score: "score.pdf", passages: [{ id: "1", label: "Entry", start: 0, end: 12 }], cleanup: { preset: "archive", hum: false }, created: "2026-08-28T00:00:00Z" });
    expect(receipt).toContain("Original source modified: No");
    expect(receipt).toContain("Rights confirmed");
    const zip = makeZip([{ name: "receipt.txt", data: new TextEncoder().encode(receipt) }]);
    expect(new DataView(zip.buffer).getUint32(0, true)).toBe(0x04034b50);
    expect(new DataView(zip.buffer).getUint32(zip.length - 22, true)).toBe(0x06054b50);
  });
});
