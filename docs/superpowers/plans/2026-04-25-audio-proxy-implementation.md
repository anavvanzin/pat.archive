# Audio Proxy Implementation Plan

**Goal:** Implement a server-side proxy endpoint in `server.js` to bypass CORS issues when importing remote audio files, and update `SourceBrowser.tsx` to utilize this proxy.

**Architecture:** Add a route `/api/audio-proxy` to the root Express server. This route will fetch the external resource and stream it back to the client.

**Tech Stack:** Express.js, Node.js `fetch` (or `axios`).

---

### Task 1: Implement Audio Proxy in `server.js`

**Files:**
- Modify: `server.js`

- [ ] **Step 1: Create Proxy Route**
  Add a GET endpoint that accepts a `url` query parameter.
- [ ] **Step 2: Implement Proxy Logic**
  Use standard node `fetch` to retrieve the audio content. Ensure headers (Content-Type) are forwarded.
- [ ] **Step 3: Commit**
  `git add server.js && git commit -m "feat: add audio proxy endpoint to server.js"`

### Task 2: Update SourceBrowser

**Files:**
- Modify: `melovanzin/src/studio/components/SourceBrowser.tsx`

- [ ] **Step 1: Update Import Handler**
  Update `handleLyraImport` to fetch from `/api/audio-proxy?url=...` instead of the direct URL.
- [ ] **Step 2: Error Handling**
  Update the error state management to handle proxy-specific errors.
- [ ] **Step 3: Commit**
  `git add melovanzin/src/studio/components/SourceBrowser.tsx && git commit -m "feat: use proxy for audio imports"`

---

### Execution Choice:
1. **Subagent-Driven** (I will spawn subagents for backend and frontend tasks).
2. **Inline Execution** (I will handle these directly).

Which do you prefer?
