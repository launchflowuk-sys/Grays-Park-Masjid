#!/usr/bin/env node
/**
 * Starts the Expo Metro bundler and automatically selects
 * "Proceed anonymously" when the Expo CLI login prompt appears.
 *
 * The Expo CLI prompt is an interactive inquirer menu:
 *   ❯  Log in
 *      Proceed anonymously
 *
 * We pipe stdin so we can write to it, then send:
 *   ESC [ B  (ANSI down-arrow) + newline  → selects second item
 *
 * We do this at 2 s and again at 5 s in case the first attempt
 * lands before the prompt is ready.
 *
 * NOTE: Do NOT set CI=1 here. CI mode tells Expo that no interactive
 * input is allowed at all, causing a hard 500 error when Expo Go
 * tries to load the app manifest on a physical device. Instead we
 * let Expo run normally and answer the login prompt via stdin.
 */
const { spawn } = require("child_process");

const port = process.env.PORT || "18115";

// EXPO_NO_TELEMETRY suppresses analytics prompts without disabling
// interactive mode entirely (unlike CI=1 which breaks Expo Go).
const env = { ...process.env, EXPO_NO_TELEMETRY: "1" };

const proc = spawn(
  "pnpm",
  ["exec", "expo", "start", "--localhost", "--port", port],
  {
    stdio: ["pipe", "inherit", "inherit"],
    env,
  }
);

let answered = false;

function selectProceedAnonymously() {
  if (!answered && proc.stdin && !proc.stdin.destroyed) {
    // Down-arrow moves selection to "Proceed anonymously", newline confirms.
    proc.stdin.write("\x1B[B\n");
  }
}

// First attempt — prompt usually appears within 1-2 s
const t1 = setTimeout(() => {
  selectProceedAnonymously();
}, 2000);

// Second attempt — in case the first fired too early
const t2 = setTimeout(() => {
  selectProceedAnonymously();
  answered = true; // stop after second attempt
}, 5500);

proc.on("exit", (code) => {
  clearTimeout(t1);
  clearTimeout(t2);
  process.exit(code ?? 0);
});

proc.on("error", (err) => {
  console.error("Failed to start Metro:", err);
  process.exit(1);
});
