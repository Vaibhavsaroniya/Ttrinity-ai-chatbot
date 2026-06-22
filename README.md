# Trinity AI Chatbot

A premium, highly interactive AI Chatbot application built using **React** (frontend) and **Express/Node.js** (backend), integrated with the **Groq SDK** utilizing Llama 3.3.

## Project Structure
- `client/`: React frontend with full dark/light glassmorphic UI.
- `server/`: Node.js/Express backend connecting to Groq.
- `git-sync-watcher.js`: Auto-watcher that automatically commits and pushes file changes to GitHub.

## How to Run locally
1. Start the backend server:
   ```bash
   npm run dev:server
   ```
2. Start the React frontend dev server:
   ```bash
   npm run dev:client
   ```
3. Start the Git Auto-Commit Watcher:
   ```bash
   npm run watch-git
   ```
