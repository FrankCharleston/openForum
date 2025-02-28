document.addEventListener("DOMContentLoaded", () => {
  applySystemTheme();
  loadOptions();
  addEventListeners();
});

/**
 * Applies system theme.
 */
function applySystemTheme() {
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'cyberpunk-dark' : 'cyberpunk-light';
  document.body.classList.add(systemTheme);
  document.body.classList.add('cyberpunk-theme');
}

/**
 * Adds event listeners for buttons.
 */
function addEventListeners() {
  document.getElementById("saveOptions").addEventListener("click", saveOptions);
  document.getElementById("exportLogs").addEventListener("click", exportLogs);
  document.getElementById("clearLogs").addEventListener("click", clearLogs);
  document.getElementById("toggleDefaultPassphrase").addEventListener("click", togglePassphraseVisibility);
  document.getElementById("closeOptions").addEventListener("click", () => window.close());
}

/**
 * Loads options from Chrome storage.
 */
function loadOptions() {
  chrome.storage.local.get(["autoDecrypt", "defaultPassphrase", "debug", "logs"], (data) => {
    document.getElementById("autoDecrypt").value = data.autoDecrypt ? "true" : "false";
    document.getElementById("defaultPassphrase").value = data.defaultPassphrase || "";
    document.getElementById("debug").checked = data.debug || false;
    displayLogs(data.logs || []);
  });
}

/**
 * Saves options to Chrome storage.
 */
function saveOptions() {
  const autoDecrypt = document.getElementById("autoDecrypt").value === "true";
  const defaultPassphrase = document.getElementById("defaultPassphrase").value;
  const debug = document.getElementById("debug").checked;

  chrome.storage.local.set({ autoDecrypt, defaultPassphrase, debug }, () => {
    alert("✅ Options saved.");
  });
}

/**
 * Exports logs as a .txt file.
 */
function exportLogs() {
  chrome.storage.local.get("logs", (data) => {
    const logs = data.logs || [];
    if (logs.length === 0) return alert("⚠️ No logs to export.");

    const blob = new Blob([logs.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "openForum_logs.txt";
    a.click();
    URL.revokeObjectURL(url);
  });
}

/**
 * Clears logs from storage.
 */
function clearLogs() {
  chrome.storage.local.set({ logs: [] }, () => {
    document.getElementById("output").value = "";
    alert("🗑 Logs cleared.");
  });
}

/**
 * Toggles visibility of the default passphrase input.
 */
function togglePassphraseVisibility() {
  const passphraseInput = document.getElementById("defaultPassphrase");
  const toggleButton = document.getElementById("toggleDefaultPassphrase");
  passphraseInput.type = passphraseInput.type === "password" ? "text" : "password";
  toggleButton.textContent = passphraseInput.type === "password" ? "👁️" : "🙈";
}

/**
 * Displays logs in the textarea.
 */
function displayLogs(logs) {
  document.getElementById("output").value = logs.length ? logs.join("\n") : "No logs available.";
}
