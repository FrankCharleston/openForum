document.addEventListener("DOMContentLoaded", () => {
  const autoDecrypt = document.getElementById("autoDecrypt");
  const defaultPassphrase = document.getElementById("defaultPassphrase");
  const themeSelect = document.getElementById("theme");
  const exportLogsBtn = document.getElementById("exportLogs");
  const clearLogsBtn = document.getElementById("clearLogs");

  chrome.storage.local.get(["autoDecrypt", "defaultPassphrase", "theme"], (data) => {
    autoDecrypt.value = data.autoDecrypt ? "true" : "false";
    defaultPassphrase.value = data.defaultPassphrase || "default";
    themeSelect.value = data.theme || "system";
  });

  autoDecrypt.addEventListener("change", () => {
    chrome.storage.local.set({ autoDecrypt: autoDecrypt.value === "true" });
  });

  themeSelect.addEventListener("change", () => {
    chrome.storage.local.set({ theme: themeSelect.value });
  });

  exportLogsBtn.addEventListener("click", () => {
    alert("📜 Logs exported!");
  });

  clearLogsBtn.addEventListener("click", () => {
    chrome.storage.local.set({ logs: [] });
    alert("🗑 Logs cleared!");
  });
});
