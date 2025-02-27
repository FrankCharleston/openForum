// Listener for when the options page is loaded
document.addEventListener("DOMContentLoaded", () => {
  loadOptions();
  document.getElementById("saveOptions").addEventListener("click", saveOptions);
  document.getElementById("exportLogs").addEventListener("click", exportLogs);
  document.getElementById("clearLogs").addEventListener("click", clearLogs);
  document.getElementById("toggleDefaultPassphrase").addEventListener("click", togglePassphraseVisibility);
  document.getElementById("closeOptions").addEventListener("click", () => window.close());
});

// Function to load options from storage
function loadOptions() {
  chrome.storage.local.get(["autoDecrypt", "defaultPassphrase", "debug"], (data) => {
    document.getElementById("autoDecrypt").value = data.autoDecrypt ? "true" : "false";
    document.getElementById("defaultPassphrase").value = data.defaultPassphrase || "";
    document.getElementById("debug").checked = data.debug || false;
  });
}

// Function to save options to storage
function saveOptions() {
  const autoDecrypt = document.getElementById("autoDecrypt").value === "true";
  const defaultPassphrase = document.getElementById("defaultPassphrase").value;
  const debug = document.getElementById("debug").checked;

  chrome.storage.local.set({ autoDecrypt, defaultPassphrase, debug }, () => {
    alert("✅ Options saved.");
  });
}

// Function to export logs to a file
function exportLogs() {
  chrome.storage.local.get("logs", (data) => {
    const logs = data.logs || [];
    const blob = new Blob([logs.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "openForum_logs.txt";
    a.click();
    URL.revokeObjectURL(url);
  });
}

// Function to clear logs from storage
function clearLogs() {
  chrome.storage.local.set({ logs: [] }, () => {
    alert("🗑 Logs cleared.");
  });
}

// Function to toggle passphrase visibility
function togglePassphraseVisibility() {
  const passphraseInput = document.getElementById("defaultPassphrase");
  const toggleButton = document.getElementById("toggleDefaultPassphrase");
  passphraseInput.type = passphraseInput.type === "password" ? "text" : "password";
  toggleButton.textContent = passphraseInput.type === "password" ? "👁️" : "🙈";
}
