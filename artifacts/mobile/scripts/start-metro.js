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
 */
const { spawn } = require("child_process");

const port = process.env.PORT || "18115";

// CI=1 tells Expo CLI to skip interactive login prompts
const env = { ...process.env, CI: "1" };

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
