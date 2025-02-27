document.addEventListener("DOMContentLoaded", async () => {
  loadSettings();
  setupEventListeners();
  applySystemTheme();
  logAction("Options page loaded");
  makeScrollableIfOverscan();

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateOptionsOutput") {
      const output = document.getElementById("output");
      if (output) {
        output.value = request.value;
      }
    }
  });
});

/**
 * Applies the system theme.
 */
function applySystemTheme() {
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'cyberpunk-dark' : 'cyberpunk-light';
  document.body.classList.add(systemTheme);
  document.body.classList.add('cyberpunk-theme'); // Ensure theme class is applied
  document.body.classList.add('centered-ui'); // Center the UI
}

/**
 * Loads settings and applies them.
 */
function loadSettings() {
  chrome.storage.local.get(["autoDecrypt", "defaultPassphrase", "debug"], (data) => {
    document.getElementById("autoDecrypt").checked = data.autoDecrypt ?? false;
    document.getElementById("defaultPassphrase").value = data.defaultPassphrase || "";
    document.getElementById("debug").checked = data.debug ?? false;

    toggleDefaultPassphraseVisibility(data.autoDecrypt ?? false);
  });
}

/**
 * Saves settings to Chrome Storage.
 */
function saveSettings() {
  const autoDecrypt = document.getElementById("autoDecrypt").checked;
  const defaultPassphrase = document.getElementById("defaultPassphrase").value;
  const debug = document.getElementById("debug").checked;

  chrome.storage.local.set({ autoDecrypt, defaultPassphrase, debug }, () => {
    alert("💾 Settings saved!");
    logAction("Settings saved");
  });
}

/**
 * Exports logs to a `.txt` file.
 */
function exportLogs() {
  chrome.storage.local.get(["logs"], (data) => {
    const logs = data.logs || [];
    if (logs.length === 0) {
      alert("⚠️ No logs to export.");
      return;
    }

    const blob = new Blob([logs.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "openforum_logs.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert("📜 Logs saved as openforum_logs.txt");
    logAction("Logs exported");
  });
}

/**
 * Clears stored logs.
 */
function clearLogs() {
  chrome.storage.local.set({ logs: [] }, () => {
    alert("🗑 Logs cleared.");
    logAction("Logs cleared");
  });
}

/**
 * Sets up event listeners for buttons.
 */
function setupEventListeners() {
  document.getElementById("saveOptions").addEventListener("click", saveSettings);
  document.getElementById("exportLogs").addEventListener("click", exportLogs);
  document.getElementById("clearLogs").addEventListener("click", clearLogs);
  document.getElementById("closeOptions").addEventListener("click", () => window.close());
  document.getElementById("toggleDefaultPassphrase").addEventListener("click", () => {
    const defaultPassphraseInput = document.getElementById("defaultPassphrase");
    defaultPassphraseInput.type = defaultPassphraseInput.type === "password" ? "text" : "password";
    document.getElementById("toggleDefaultPassphrase").textContent = defaultPassphraseInput.type === "password" ? "👁️" : "🙈";
  });
  document.getElementById("autoDecrypt").addEventListener("change", (event) => {
    toggleDefaultPassphraseVisibility(event.target.checked);
  });
  document.getElementById("debug").addEventListener("change", (event) => {
    logAction(`Debug mode ${event.target.checked ? "enabled" : "disabled"}`);
  });
}

/**
 * Toggles the visibility of the default passphrase field based on auto-decrypt status.
 */
function toggleDefaultPassphraseVisibility(isVisible) {
  const defaultPassphraseField = document.getElementById("defaultPassphraseField");
  defaultPassphraseField.style.display = isVisible ? "block" : "none";
}

/**
 * Logs actions to persistent storage and UI.
 */
function logAction(action) {
  chrome.storage.local.get(["logs", "debug"], (data) => {
    const logs = data.logs || [];
    const logEntry = `${new Date().toISOString()}: ${action}`;
    logs.push(logEntry);
    chrome.storage.local.set({ logs });

    logMessage(action);

    if (data.debug) {
      console.debug(action);
    }
  });
}

/**
 * Logs messages in UI.
 */
function logMessage(message) {
  const logContainer = document.getElementById("logContainer");
  if (!logContainer) return;

  const logEntry = document.createElement("div");
  logEntry.textContent = `📌 ${message}`;
  logEntry.className = "log-entry";
  logContainer.appendChild(logEntry);

  logContainer.scrollTop = logContainer.scrollHeight;
}

/**
 * Makes the UI scrollable if it overscans.
 */
function makeScrollableIfOverscan() {
  const body = document.body;
  if (body.scrollHeight > window.innerHeight) {
    body.style.overflowY = "scroll";
  } else {
    body.style.overflowY = "hidden";
  }
}
