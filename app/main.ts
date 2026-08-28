import "./styles.css";
import { encodeWav, formatTime, makeZip, parseTime, PRESETS, receiptText, safeName, scoreSections, type Cleanup, type Passage } from "../src/core";

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const audioInput = $("#audio-file") as HTMLInputElement;
const scoreInput = $("#score-file") as HTMLInputElement;
const canvas = $("#waveform") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const passages: Passage[] = [];
let removed: { passage: Passage; index: number } | null = null;
let audioBuffer: AudioBuffer | null = null;
let audioFileName = "Not attached";
let scoreFileName = "Not attached";
let scoreLabels: string[] = [];
let scoreObjectUrl: string | null = null;
let audioContext: AudioContext | null = null;
let playing: AudioBufferSourceNode | null = null;
let playTimer = 0;
let selection = { start: 0, end: 30 };
let dragStart: number | null = null;
let licensed = false;
let demoMode = location.pathname.replace(/\/$/, "") === "/demo" || new URL(location.href).searchParams.get("demo") === "1";

const REAL_PROJECT_KEY = "choir-cleanup:project";
const REAL_THEME_KEY = "choir-cleanup:theme";

function makeSampleAudio(): AudioBuffer {
  const sampleRate = 16_000;
  const seconds = 18;
  const buffer = new AudioBuffer({ length: sampleRate * seconds, numberOfChannels: 1, sampleRate });
  const data = buffer.getChannelData(0);
  const notes = [220, 277.18, 329.63, 440];
  for (let i = 0; i < data.length; i++) {
    const time = i / sampleRate;
    const phrase = Math.min(1, (time % 6) / .35, (6 - (time % 6)) / .45);
    const choir = notes.reduce((sum, hz, voice) => sum + Math.sin(2 * Math.PI * hz * time + voice * .31) * (.055 - voice * .006), 0);
    const room = Math.sin(2 * Math.PI * 61 * time) * .008 + Math.sin(2 * Math.PI * 3300 * time) * .003;
    data[i] = (choir + room) * Math.max(0, phrase);
  }
  return buffer;
}

function clearProject() {
  stopPlayback();
  passages.splice(0);
  removed = null;
  audioBuffer = null;
  audioFileName = "Not attached";
  scoreFileName = "Not attached";
  scoreLabels = [];
  selection = { start: 0, end: 30 };
  audioInput.value = "";
  scoreInput.value = "";
  $("#audio-drop").classList.remove("has-file");
  $("#score-drop").classList.remove("has-file");
  $("#audio-meta").textContent = "Choose a supported recording";
  $("#score-meta").textContent = "MusicXML, XML, MXL, or PDF";
  $("#empty-wave").hidden = false;
  $("#wave-area").hidden = true;
  $("#view-score").hidden = true;
  $("#undo").hidden = true;
  $("#source-error").hidden = true;
  ($("#rights") as HTMLInputElement).checked = false;
  ($("#project-name") as HTMLInputElement).value = "Choir rehearsal pack";
  ($("#prepared-by") as HTMLInputElement).value = "";
  ($("#archive-notes") as HTMLInputElement).value = "";
  syncSelection();
  renderPassages();
  drawWaveform();
}

function loadSampleProject() {
  demoMode = true;
  document.title = "Demo — Choir Cleanup";
  $("#demo-banner").hidden = false;
  passages.splice(0);
  removed = null;
  audioBuffer = makeSampleAudio();
  audioFileName = "st-anne-community-choir-rehearsal.wav";
  scoreFileName = "st-anne-autumn-concert.musicxml";
  scoreLabels = ["Opening hymn", "Verse 2 entries", "Final cadence"];
  selection = { start: 0, end: 6 };
  $("#audio-drop").classList.add("has-file");
  $("#score-drop").classList.add("has-file");
  $("#audio-meta").textContent = `${audioFileName} · ${formatTime(duration())} · 16,000 Hz · 1 ch`;
  $("#score-meta").textContent = `${scoreFileName} · Autumn concert rehearsal · 3 rehearsal marks`;
  $("#empty-wave").hidden = true;
  $("#wave-area").hidden = false;
  $("#view-score").hidden = true;
  $("#undo").hidden = true;
  $("#source-error").hidden = true;
  ($("#rights") as HTMLInputElement).checked = false;
  ($("#project-name") as HTMLInputElement).value = "St Anne autumn concert";
  makeScoreSuggestions();
  renderPassages();
  syncSelection();
  drawWaveform();
  updateReceipt();
  $("#sources").scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

function cleanup(): Cleanup {
  return { preset: (document.querySelector<HTMLInputElement>('input[name="preset"]:checked')?.value || "archive") as Cleanup["preset"], hum: ($("#hum") as HTMLInputElement).checked };
}

function setStatus(message: string, kind: "normal" | "success" | "error" = "normal") {
  const node = $("#export-status"); node.textContent = message; node.className = `status ${kind === "normal" ? "" : kind}`;
}

function duration() { return audioBuffer?.duration || 0; }

function passageIsInBounds(passage: Passage) {
  return Number.isFinite(passage.start) && Number.isFinite(passage.end) && passage.start >= 0 && passage.end > passage.start && passage.end <= duration();
}

function canExport() {
  return !!audioBuffer && passages.length > 0 && passages.every(passageIsInBounds) && ($("#rights") as HTMLInputElement).checked;
}

function resetRightsConfirmation() {
  const rights = $("#rights") as HTMLInputElement;
  const wasConfirmed = rights.checked;
  rights.checked = false;
  return wasConfirmed;
}

function showSourceMessage(message: string, kind: "normal" | "error" = "normal") {
  const node = $("#source-error");
  node.hidden = false;
  node.className = `message${kind === "error" ? " error" : ""}`;
  node.textContent = message;
}

function updateReceipt() {
  const values = [audioFileName, scoreFileName, `${passages.length} marked`, `${PRESETS[cleanup().preset].name}${cleanup().hum ? " + hum notches" : ""}`];
  $("#receipt-preview").querySelectorAll("dd").forEach((dd, i) => dd.textContent = values[i]);
  $("#passage-count").textContent = String(passages.length);
  const rangesValid = passages.every(passageIsInBounds);
  ($("#export-button") as HTMLButtonElement).disabled = !canExport();
  if (!audioBuffer) setStatus("Choose a source recording to begin.");
  else if (!passages.length) setStatus("Mark at least one passage to export.");
  else if (!rangesValid) setStatus("A passage falls outside this recording. Review the passage times before export.", "error");
  else if (!( $("#rights") as HTMLInputElement).checked) setStatus("Confirm recording rights to enable export.");
  else setStatus(`Ready to render ${passages.length} labeled WAV ${passages.length === 1 ? "excerpt" : "excerpts"}.`, "success");
  if (!demoMode) localStorage.setItem(REAL_PROJECT_KEY, JSON.stringify({ project: ($("#project-name") as HTMLInputElement).value, preparedBy: ($("#prepared-by") as HTMLInputElement).value, notes: ($("#archive-notes") as HTMLInputElement).value }));
}

function renderPassages() {
  const list = $("#passage-list"); list.replaceChildren();
  passages.forEach((passage, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="index">${String(index + 1).padStart(2, "0")}</span><span><strong></strong><small></small></span><button class="preview" type="button" aria-label="Preview passage">▶ Preview</button><button type="button" aria-label="Remove passage">Remove</button>`;
    li.querySelector("strong")!.textContent = passage.label;
    li.querySelector("small")!.textContent = `${formatTime(passage.start)} — ${formatTime(passage.end)}${passage.source === "score" ? " · score suggestion" : ""}`;
    const buttons = li.querySelectorAll("button");
    buttons[0].addEventListener("click", () => playRange(passage, true));
    buttons[1].addEventListener("click", () => { removed = { passage, index }; passages.splice(index, 1); $("#undo").hidden = false; renderPassages(); drawWaveform(); updateReceipt(); });
    li.addEventListener("click", (event) => { if ((event.target as Element).tagName !== "BUTTON") { selection = { start: passage.start, end: passage.end }; syncSelection(); drawWaveform(); } });
    list.append(li);
  });
  updateReceipt();
}

function syncSelection() {
  ($("#passage-start") as HTMLInputElement).value = formatTime(selection.start);
  ($("#passage-end") as HTMLInputElement).value = formatTime(selection.end);
}

function drawWaveform() {
  const style = getComputedStyle(document.documentElement); const width = canvas.width; const height = canvas.height;
  ctx.clearRect(0, 0, width, height); ctx.fillStyle = style.getPropertyValue("--paper"); ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = style.getPropertyValue("--line"); ctx.lineWidth = 1;
  for (let x = 0; x < width; x += width / 12) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(0, height / 2); ctx.lineTo(width, height / 2); ctx.stroke();
  if (!audioBuffer) return;
  const data = audioBuffer.getChannelData(0); const step = Math.max(1, Math.floor(data.length / width));
  ctx.strokeStyle = style.getPropertyValue("--blue-deep"); ctx.lineWidth = 1.5; ctx.beginPath();
  for (let x = 0; x < width; x++) { let min = 1, max = -1; const from = x * step; for (let j = 0; j < step; j++) { const value = data[from + j] || 0; min = Math.min(min, value); max = Math.max(max, value); } ctx.moveTo(x, (1 + min) * height / 2); ctx.lineTo(x, (1 + max) * height / 2); } ctx.stroke();
  const x1 = selection.start / duration() * width; const x2 = selection.end / duration() * width;
  ctx.fillStyle = `${style.getPropertyValue("--pencil")}33`; ctx.fillRect(x1, 0, Math.max(2, x2 - x1), height);
  ctx.strokeStyle = style.getPropertyValue("--pencil"); ctx.lineWidth = 3; [x1, x2].forEach((x) => { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); });
}

function makeScoreSuggestions() {
  if (!audioBuffer || !scoreLabels.length || passages.some((passage) => passage.source === "score")) return 0;
  const span = duration() / scoreLabels.length;
  scoreLabels.forEach((label, i) => passages.push({ id: crypto.randomUUID(), label, start: i * span, end: Math.min(duration(), (i + 1) * span), source: "score" }));
  return scoreLabels.length;
}

audioInput.addEventListener("change", async () => {
  const file = audioInput.files?.[0]; if (!file) return;
  const message = $("#source-error"); message.hidden = true; $("#audio-meta").textContent = `Decoding ${file.name} locally…`;
  try {
    audioContext ||= new AudioContext(); const decoded = await audioContext.decodeAudioData(await file.arrayBuffer());
    stopPlayback(); audioBuffer = decoded; audioFileName = file.name; passages.splice(0); removed = null; $("#undo").hidden = true; const rightsWereConfirmed = resetRightsConfirmation();
    selection = { start: 0, end: Math.min(30, duration()) }; syncSelection();
    $("#audio-meta").textContent = `${file.name} · ${formatTime(duration())} · ${audioBuffer.sampleRate.toLocaleString()} Hz · ${audioBuffer.numberOfChannels} ch`;
    $("#audio-drop").classList.add("has-file"); $("#empty-wave").hidden = true; $("#wave-area").hidden = false;
    $("#play-time").textContent = `0:00.0 / ${formatTime(duration())}`; const suggestionCount = makeScoreSuggestions(); renderPassages(); drawWaveform();
    const suggestionNote = suggestionCount ? ` ${suggestionCount} score marks were respaced for this recording. Confirm their timing.` : " Mark passages for this recording.";
    showSourceMessage(`Recording changed.${suggestionNote}${rightsWereConfirmed ? " Confirm rights again before export." : ""}`);
  } catch (error) {
    const retainedSource = audioBuffer ? "The previous recording is still loaded." : "No recording was loaded.";
    showSourceMessage(`Could not decode “${file.name}”. Convert it to PCM WAV and try again. ${retainedSource} ${error instanceof Error ? error.message : ""}`, "error");
    $("#audio-meta").textContent = audioBuffer ? `${audioFileName} · ${formatTime(duration())} · still loaded` : "Choose a supported recording"; updateReceipt();
  }
});

scoreInput.addEventListener("change", async () => {
  const file = scoreInput.files?.[0]; if (!file) return;
  let nextLabels: string[] = []; let nextMeta = `${file.name} · attached as visual reference; mark timings while reading it`;
  if (/\.(xml|musicxml)$/i.test(file.name)) { const parsed = scoreSections(await file.text()); nextLabels = parsed.labels; nextMeta = `${file.name}${parsed.title ? ` · ${parsed.title}` : ""} · ${nextLabels.length} rehearsal marks`; }
  scoreFileName = file.name; scoreLabels = nextLabels;
  if (scoreObjectUrl) { URL.revokeObjectURL(scoreObjectUrl); scoreObjectUrl = null; }
  $("#view-score").hidden = true;
  if (/\.pdf$/i.test(file.name)) { scoreObjectUrl = URL.createObjectURL(file); ($("#score-frame") as HTMLIFrameElement).src = scoreObjectUrl; $("#view-score").hidden = false; }
  $("#score-meta").textContent = nextMeta; $("#score-drop").classList.add("has-file");
  for (let i = passages.length - 1; i >= 0; i--) if (passages[i].source === "score") passages.splice(i, 1);
  removed = null; $("#undo").hidden = true; const rightsWereConfirmed = resetRightsConfirmation(); const suggestionCount = makeScoreSuggestions(); renderPassages(); drawWaveform();
  const suggestionNote = suggestionCount ? `${suggestionCount} new score marks were spaced as editable suggestions.` : "The old score suggestions were removed.";
  showSourceMessage(`Section map changed. ${suggestionNote}${rightsWereConfirmed ? " Confirm rights again before export." : ""}`);
});

$("#load-sample").addEventListener("click", loadSampleProject);
$("#reset-demo").addEventListener("click", loadSampleProject);
$("#leave-demo").addEventListener("click", () => {
  if (location.pathname.replace(/\/$/, "") === "/demo") { location.assign("/#download"); return; }
  demoMode = false;
  $("#demo-banner").hidden = true;
  document.title = "Choir Cleanup — Make documented rehearsal copies";
  history.replaceState({}, "", location.pathname);
  clearProject();
  $("#app-title").focus();
});

$("#view-score").addEventListener("click", () => ($("#score-dialog") as HTMLDialogElement).showModal());
$("#close-score").addEventListener("click", () => ($("#score-dialog") as HTMLDialogElement).close());

canvas.addEventListener("pointerdown", (event) => { if (!audioBuffer) return; const rect = canvas.getBoundingClientRect(); dragStart = Math.max(0, Math.min(duration(), (event.clientX - rect.left) / rect.width * duration())); canvas.setPointerCapture(event.pointerId); });
canvas.addEventListener("pointerup", (event) => { if (dragStart === null) return; const rect = canvas.getBoundingClientRect(); const point = Math.max(0, Math.min(duration(), (event.clientX - rect.left) / rect.width * duration())); selection = { start: Math.min(dragStart, point), end: Math.max(dragStart, point) }; if (selection.end - selection.start < .25) selection.end = Math.min(duration(), selection.start + 5); dragStart = null; syncSelection(); drawWaveform(); });
canvas.addEventListener("keydown", (event) => { if (!["ArrowLeft", "ArrowRight"].includes(event.key) || !audioBuffer) return; event.preventDefault(); selection.end = Math.max(selection.start + .1, Math.min(duration(), selection.end + (event.key === "ArrowRight" ? .5 : -.5))); syncSelection(); drawWaveform(); });

$("#passage-form").addEventListener("submit", (event) => {
  event.preventDefault(); const start = parseTime(( $("#passage-start") as HTMLInputElement).value); const end = parseTime(( $("#passage-end") as HTMLInputElement).value); const error = $("#passage-error");
  if (!audioBuffer) { error.textContent = "Choose a recording first."; return; }
  if (start === null || end === null || start < 0 || end <= start || end > duration()) { error.textContent = `Use valid times within 0:00.0 and ${formatTime(duration())}; end must follow start.`; return; }
  error.textContent = ""; passages.push({ id: crypto.randomUUID(), label: ( $("#passage-name") as HTMLInputElement).value.trim(), start, end, source: "manual" });
  ( $("#passage-name") as HTMLInputElement).value = `Rehearsal passage ${passages.length + 1}`; renderPassages(); drawWaveform();
});

$("#undo").addEventListener("click", () => { if (!removed) return; passages.splice(removed.index, 0, removed.passage); removed = null; $("#undo").hidden = true; renderPassages(); drawWaveform(); });

async function renderRange(passage: { start: number; end: number }, applyCleanup: boolean): Promise<AudioBuffer> {
  if (!audioBuffer) throw new Error("No audio loaded");
  if (!Number.isFinite(passage.start) || !Number.isFinite(passage.end) || passage.start < 0 || passage.end <= passage.start || passage.end > duration()) throw new Error("A passage falls outside the current recording. Review its start and end times");
  const channels = Math.min(2, audioBuffer.numberOfChannels); const length = Math.ceil((passage.end - passage.start) * audioBuffer.sampleRate);
  const offline = new OfflineAudioContext(channels, length, audioBuffer.sampleRate); const source = offline.createBufferSource(); source.buffer = audioBuffer; let tail: AudioNode = source;
  if (applyCleanup) {
    const config = cleanup(); const high = offline.createBiquadFilter(); high.type = "highpass"; high.frequency.value = config.preset === "archive" ? 65 : 80; high.Q.value = .7; tail.connect(high); tail = high;
    if (config.hum) for (const hz of [50, 60]) { const notch = offline.createBiquadFilter(); notch.type = "notch"; notch.frequency.value = hz; notch.Q.value = 18; tail.connect(notch); tail = notch; }
    if (config.preset === "clarity") { const presence = offline.createBiquadFilter(); presence.type = "peaking"; presence.frequency.value = 2600; presence.Q.value = .75; presence.gain.value = 2; tail.connect(presence); const compressor = offline.createDynamicsCompressor(); compressor.threshold.value = -20; compressor.knee.value = 12; compressor.ratio.value = 2; compressor.attack.value = .02; compressor.release.value = .2; presence.connect(compressor); tail = compressor; }
    if (config.preset === "hiss") { const low = offline.createBiquadFilter(); low.type = "lowpass"; low.frequency.value = 11000; low.Q.value = .55; tail.connect(low); tail = low; }
  }
  tail.connect(offline.destination); source.start(0, passage.start, passage.end - passage.start); return offline.startRendering();
}

async function playRange(passage: { start: number; end: number }, processed: boolean) {
  stopPlayback(); if (!audioBuffer) return; audioContext ||= new AudioContext(); await audioContext.resume();
  const buffer = processed ? await renderRange(passage, true) : audioBuffer; const source = audioContext.createBufferSource(); source.buffer = buffer; source.connect(audioContext.destination); playing = source;
  const started = performance.now(); const total = passage.end - passage.start; source.start(0, processed ? 0 : passage.start, total); source.onended = stopPlayback;
  playTimer = window.setInterval(() => { const elapsed = Math.min(total, (performance.now() - started) / 1000); $("#play-time").textContent = `${formatTime(elapsed)} / ${formatTime(total)}`; }, 100);
}
function stopPlayback() { if (playing) { playing.onended = null; try { playing.stop(); } catch {} playing = null; } clearInterval(playTimer); }
$("#play-original").addEventListener("click", () => playRange(selection, false)); $("#play-clean").addEventListener("click", () => playRange(selection, true)); $("#stop").addEventListener("click", stopPlayback);

document.querySelectorAll<HTMLInputElement>('input[name="preset"],#hum').forEach((input) => input.addEventListener("change", updateReceipt));
$("#reset-cleanup").addEventListener("click", () => { (document.querySelector('input[value="archive"]') as HTMLInputElement).checked = true; ($("#hum") as HTMLInputElement).checked = false; updateReceipt(); });
$("#rights").addEventListener("change", updateReceipt); $("#project-name").addEventListener("input", updateReceipt); $("#prepared-by").addEventListener("input", updateReceipt); $("#archive-notes").addEventListener("input", updateReceipt);

$("#export-button").addEventListener("click", async () => {
  if (!canExport()) { updateReceipt(); return; }
  const button = $("#export-button") as HTMLButtonElement; const progress = $("#export-progress") as HTMLProgressElement; button.disabled = true; progress.hidden = false; progress.value = 0; setStatus("Rendering copies locally…");
  try {
    const files: { name: string; data: Uint8Array }[] = [];
    for (let i = 0; i < passages.length; i++) { const passage = passages[i]; const rendered = await renderRange(passage, true); files.push({ name: `${String(i + 1).padStart(2, "0")}-${safeName(passage.label)}.wav`, data: encodeWav(rendered) }); progress.value = Math.round((i + 1) / (passages.length + 1) * 100); setStatus(`Rendered ${i + 1} of ${passages.length} excerpts…`); }
    const project = ( $("#project-name") as HTMLInputElement).value.trim() || "Choir rehearsal pack"; const created = new Date().toISOString();
    const receipt = receiptText({ project, audio: audioFileName, score: scoreFileName, passages, cleanup: cleanup(), created, preparedBy: licensed ? ( $("#prepared-by") as HTMLInputElement).value.trim() : "", notes: licensed ? ( $("#archive-notes") as HTMLInputElement).value.trim() : "" });
    const manifest = JSON.stringify({ format: "choir-cleanup-pack-v1", project, created, sources: { audio: audioFileName, sectionMap: scoreFileName }, originalModified: false, cleanup: cleanup(), passages }, null, 2);
    files.push({ name: "EDIT-RECEIPT.txt", data: new TextEncoder().encode(receipt) }, { name: "pack-manifest.json", data: new TextEncoder().encode(manifest) }); const zip = makeZip(files); progress.value = 100;
    const fileName = `${safeName(project)}.zip`; let saved = false;
    if ("__TAURI_INTERNALS__" in window) { const { invoke } = await import("@tauri-apps/api/core"); const path = await invoke<string | null>("save_bytes", { suggestedName: fileName, data: Array.from(zip) }); saved = !!path; if (path) setStatus(`Pack saved to ${path}`, "success"); }
    else { const url = URL.createObjectURL(new Blob([zip], { type: "application/zip" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = fileName; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); saved = true; setStatus(`Exported ${fileName}. The original was not changed.`, "success"); }
    if (!saved) setStatus("Export canceled. No files were written.");
  } catch (error) { setStatus(`Export failed: ${error instanceof Error ? error.message : "unknown error"}. Your source is unchanged.`, "error"); }
  finally { progress.hidden = true; button.disabled = !canExport(); }
});

function applyLicenseState(valid: boolean, message = "") { licensed = valid; $("#steward-tools").hidden = !valid; $("#license-state").textContent = valid ? "Steward unlocked" : "Free edition"; $("#license-message").textContent = message; }
async function verifyLicense(token: string, force = false) {
  if (demoMode) { applyLicenseState(false, "License checks are off in the sample project. Start for real to restore a purchase."); return; }
  if (!token.trim()) { applyLicenseState(false, "Paste the license token from your receipt."); return; }
  const key = "sb_license:score-aligned-choir-cleanup"; const cacheKey = `${key}:verdict`; localStorage.setItem(key, token.trim());
  const cached = JSON.parse(localStorage.getItem(cacheKey) || "null") as { valid: boolean; checked: number } | null;
  if (!force && cached && Date.now() - cached.checked < 86_400_000) { applyLicenseState(cached.valid, cached.valid ? "Steward license verified." : "License no longer active. You can keep using every core export tool."); return; }
  applyLicenseState(cached?.valid === true, navigator.onLine ? "Checking license…" : "Offline: using the last verified license state."); if (!navigator.onLine) return;
  try { const response = await fetch(`https://api.sociobot.in/api/v1/products/score-aligned-choir-cleanup/verify?license=${encodeURIComponent(token.trim())}`); const result = await response.json() as { valid: boolean; reason?: string }; localStorage.setItem(cacheKey, JSON.stringify({ valid: result.valid, checked: Date.now() })); applyLicenseState(result.valid, result.valid ? "Steward license verified." : `License no longer active (${result.reason || "invalid"}). Core tools remain available.`); }
  catch { applyLicenseState(cached?.valid === true, "Could not reach license service. Core tools remain available; a prior verified unlock stays available offline."); }
}
$("#license-restore").addEventListener("click", () => verifyLicense(( $("#license-input") as HTMLInputElement).value, true));
const licenseFromUrl = demoMode ? null : new URL(location.href).searchParams.get("license"); if (licenseFromUrl) { history.replaceState({}, "", location.pathname + location.hash); verifyLicense(licenseFromUrl, true); } else if (!demoMode) { const token = localStorage.getItem("sb_license:score-aligned-choir-cleanup"); if (token) verifyLicense(token); }

function networkState() { $("#network").textContent = navigator.onLine ? "● Local workspace" : "○ Offline · local tools ready"; }
addEventListener("online", networkState); addEventListener("offline", networkState); networkState();
const savedTheme = demoMode ? null : localStorage.getItem(REAL_THEME_KEY); if (savedTheme) document.documentElement.dataset.theme = savedTheme;
$("#theme").addEventListener("click", () => { const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark"; document.documentElement.dataset.theme = next; if (!demoMode) localStorage.setItem(REAL_THEME_KEY, next); drawWaveform(); });
if (!demoMode) try { const project = JSON.parse(localStorage.getItem(REAL_PROJECT_KEY) || "null"); if (project) { ( $("#project-name") as HTMLInputElement).value = project.project || "Choir rehearsal pack"; ( $("#prepared-by") as HTMLInputElement).value = project.preparedBy || ""; ( $("#archive-notes") as HTMLInputElement).value = project.notes || ""; } } catch {}
syncSelection(); renderPassages();
if (demoMode) loadSampleProject();

async function prepareOfflineDemo() {
  if (!demoMode || location.protocol === "tauri:" || !("serviceWorker" in navigator) || !("caches" in window)) return;
  try {
    await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    const urls = [location.pathname, ...[...document.querySelectorAll<HTMLScriptElement | HTMLLinkElement>('script[src],link[rel="stylesheet"]')].map((node) => node instanceof HTMLScriptElement ? node.src : node.href)];
    await (await caches.open("choir-cleanup-site-v1.2.0")).addAll(urls);
    if (!navigator.serviceWorker.controller) await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error("Service worker did not take control")), 5000);
      navigator.serviceWorker.addEventListener("controllerchange", () => { clearTimeout(timer); resolve(); }, { once: true });
    });
    document.documentElement.dataset.offlineReady = "true";
  } catch { /* The bundled desktop app does not need a browser service worker. */ }
}
prepareOfflineDemo();
