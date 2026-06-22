const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const WATCH_DIR = __dirname;
const DEBOUNCE_MS = 5000; // Wait 5 seconds of quiet time before pushing
const IGNORED_PATHS = [
  '.git',
  'node_modules',
  'dist',
  '.env',
  '.DS_Store',
  'git-sync-watcher.js' // Ignore self to prevent loops
];

let timeoutId = null;

function shouldIgnore(filePath) {
  const relative = path.relative(WATCH_DIR, filePath);
  const parts = relative.split(path.sep);
  return IGNORED_PATHS.some(ignored => parts.includes(ignored));
}

function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: WATCH_DIR }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout.trim() || stderr.trim());
      }
    });
  });
}

async function syncWithGithub() {
  console.log(`[${new Date().toLocaleTimeString()}] Change detected. Preparing auto-sync...`);
  try {
    // 1. Add all changes
    await runCommand('git add .');

    // 2. Check if there are any staged changes
    const status = await runCommand('git status --porcelain');
    if (!status) {
      console.log('No changes to commit.');
      return;
    }

    // 3. Commit changes
    const commitMsg = `Auto-update: ${new Date().toLocaleString()}`;
    await runCommand(`git commit -m "${commitMsg}"`);
    console.log(`[${new Date().toLocaleTimeString()}] Committed: "${commitMsg}"`);

    // 4. Try to push
    const branch = await runCommand('git branch --show-current');
    console.log(`[${new Date().toLocaleTimeString()}] Pushing to origin ${branch}...`);
    
    // Check if origin remote is set
    const remotes = await runCommand('git remote');
    if (!remotes.includes('origin')) {
      console.warn(`[${new Date().toLocaleTimeString()}] Warning: Remote 'origin' is not set yet. Please run 'git remote add origin <your-github-repo-url>'`);
      return;
    }

    const pushOutput = await runCommand(`git push origin ${branch}`);
    console.log(`[${new Date().toLocaleTimeString()}] Push successful!`);
  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString()}] Error during auto-sync:`, error.message);
  }
}

// Start watching
console.log(`=================================================`);
console.log(`Trinity AI Chatbot Auto-Commit Watcher Active`);
console.log(`Watching: ${WATCH_DIR}`);
console.log(`Quiet-time delay: ${DEBOUNCE_MS / 1000}s`);
console.log(`=================================================`);

fs.watch(WATCH_DIR, { recursive: true }, (eventType, filename) => {
  if (!filename) return;

  const fullPath = path.join(WATCH_DIR, filename);
  if (shouldIgnore(fullPath)) {
    return;
  }

  // Debounce: reset the push timer on every change
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  timeoutId = setTimeout(() => {
    syncWithGithub();
  }, DEBOUNCE_MS);
});
