/**
 * CHDX SyncClient — Unified LocalStorage & Cloudflare Worker Sync Module
 * Encapsulates network push/pull, auto-save debouncing, and environment resolution.
 */
"use strict";

(function () {
  let SYNC_URL = "https://chdx-sync.warholana.workers.dev";
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    SYNC_URL = "http://127.0.0.1:8787";
  }

  const EDIT_KEY = new URLSearchParams(location.search).get("k") || "";
  let pushTimer = null;
  let clientKey = null;
  let clientDefaults = null;
  let clientStatusCallback = null;
  let internalState = {};

  const SyncClient = {
    EDIT_KEY: new URLSearchParams(location.search).get("k") || "",
    /**
     * Initializes the client with configuration.
     * @param {Object} config - Configuration settings
     * @param {string} config.key - LocalStorage key
     * @param {Object} config.defaults - Fallback/initial state structure
     * @param {Function} [config.onStatusChange] - Status UI callback (receives 'online', 'local', 'erro')
     */
    init(config) {
      clientKey = config.key;
      clientDefaults = config.defaults || {};
      clientStatusCallback = config.onStatusChange || null;

      // Load initial state from LocalStorage
      try {
        const localData = localStorage.getItem(clientKey);
        internalState = Object.assign({}, clientDefaults, localData ? JSON.parse(localData) : {});
      } catch (e) {
        internalState = Object.assign({}, clientDefaults);
      }

      this.updateStatus(this.canEdit() ? "online" : "local");
      return internalState;
    },

    /**
     * Returns the current local state.
     */
    getState() {
      return internalState;
    },

    /**
     * Check if client can edit remote state.
     */
    canEdit() {
      return !SYNC_URL || !!EDIT_KEY;
    },

    /**
     * Updates the status callback if defined.
     */
    updateStatus(status) {
      if (clientStatusCallback) {
        clientStatusCallback(status);
      }
    },

    /**
     * Pulls the remote state and merges it.
     * @param {string} field - The specific state root field to load (e.g. 'planner', 'camarim')
     */
    async pull(field) {
      if (!SYNC_URL) return false;
      try {
        const response = await fetch(SYNC_URL + "/state");
        if (!response.ok) {
          this.updateStatus("erro");
          return false;
        }
        const data = await response.json();
        if (data) {
          let updated = false;
          if (field === "planner" && data.planner) {
            internalState = Object.assign(internalState, data.planner);
            updated = true;
          } else if (field === "camarim") {
            // Index v1 expects: camarim, guests, photos
            if (data.camarim) {
              internalState.camarim = Object.assign(internalState.camarim || {}, data.camarim);
              updated = true;
            }
            if (Array.isArray(data.guests)) {
              internalState.guests = data.guests;
              updated = true;
            }
            if (data.photos) {
              internalState.photos = data.photos;
              updated = true;
            }
          }
          if (updated) {
            // Persist locally
            try {
              localStorage.setItem(clientKey, JSON.stringify(internalState));
            } catch (e) {}
            this.updateStatus(this.canEdit() ? "online" : "local");
            return true;
          }
        }
        return false;
      } catch (e) {
        this.updateStatus("erro");
        return false;
      }
    },

    /**
     * Saves new state to local storage and schedules a remote push.
     * @param {Object} state - The new state data
     * @param {string} field - The remote target field ('planner' or 'camarim')
     */
    save(state, field) {
      internalState = state;
      try {
        localStorage.setItem(clientKey, JSON.stringify(internalState));
      } catch (e) {}

      this.push(field);
    },

    /**
     * Triggers a remote push with debouncing.
     */
    push(field) {
      if (!SYNC_URL || !EDIT_KEY) return;
      clearTimeout(pushTimer);
      pushTimer = setTimeout(async () => {
        let payload = {};
        if (field === "planner") {
          payload = { planner: internalState };
        } else if (field === "camarim") {
          // camarim states are split in localStorage but merged in the worker payload
          payload = {
            camarim: internalState.camarim,
            guests: internalState.guests,
            photos: internalState.photos
          };
        }

        try {
          const response = await fetch(SYNC_URL + "/state", {
            method: "PUT",
            headers: {
              "content-type": "application/json",
              "x-edit-key": EDIT_KEY
            },
            body: JSON.stringify(payload)
          });
          if (response.ok) {
            this.updateStatus("online");
          } else {
            this.updateStatus("erro");
          }
        } catch (e) {
          this.updateStatus("erro");
        }
      }, 500);
    },

    /**
     * Resolves the correct audio proxy URL based on environment.
     * @param {string} trackUrl - Original audio file source URL
     */
    getAudioProxyUrl(trackUrl) {
      if (!trackUrl) return null;
      const isSameOrigin =
        trackUrl.startsWith("blob:") ||
        trackUrl.startsWith("/") ||
        trackUrl.startsWith(location.origin);
      if (isSameOrigin) return trackUrl;

      // Local Express backend on port 8080
      if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
        return `/api/audio-proxy?url=${encodeURIComponent(trackUrl)}`;
      }
      // Production Cloudflare Workers environment
      return `${SYNC_URL}/audio-proxy?url=${encodeURIComponent(trackUrl)}`;
    }
  };

  window.CHDX = window.CHDX || {};
  window.CHDX.SyncClient = SyncClient;
})();
