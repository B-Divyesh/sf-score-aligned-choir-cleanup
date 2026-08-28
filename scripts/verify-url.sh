#!/usr/bin/env bash
set -euo pipefail

VERIFY_URL="${1:-http://127.0.0.1:4173/}"
VERIFY_URL="$VERIFY_URL" node --input-type=module <<'NODE'
import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
page.on("pageerror", (error) => errors.push(error.message));
const response = await page.goto(process.env.VERIFY_URL, { waitUntil: "networkidle" });
if (!response?.ok()) throw new Error(`HTTP ${response?.status()}`);
const result = await page.evaluate(() => ({
  title: document.title,
  lang: document.documentElement.lang,
  mains: document.querySelectorAll("main").length,
  h1s: document.querySelectorAll("h1").length,
  imagesWithoutAlt: [...document.images].filter((image) => !image.hasAttribute("alt")).length,
}));
await browser.close();
if (!result.title || result.lang !== "en" || result.mains !== 1 || result.h1s !== 1 || result.imagesWithoutAlt || errors.length) {
  throw new Error(JSON.stringify({ ...result, errors }, null, 2));
}
console.log(JSON.stringify({ url: process.env.VERIFY_URL, ...result, consoleErrors: 0 }, null, 2));
NODE
