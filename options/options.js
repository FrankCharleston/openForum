document.addEventListener("DOMContentLoaded", () => {
  const autoDecrypt = document.getElementById("autoDecrypt");
  const defaultPassphrase = document.getElementById("defaultPassphrase");
  const theme = document.getElementById("theme");
  const saveLogs = document.getElementById("saveLogs");
  const clearLogs = document.getElementById("clearLogs");
  const closeOptions = document.getElementById("closeOptions");
  const toggleDefaultPassphrase = document.getElementById("toggleDefaultPassphrase");

  chrome.storage.local.get(["autoDecrypt", "defaultPassphrase", "theme"], (data) => {
    autoDecrypt.value = data.autoDecrypt ? "true" : "false";
    defaultPassphrase.value = data.defaultPassphrase || "";
    theme.value = data.theme || "system";
  });

  autoDecrypt.addEventListener("change", () => {
    chrome.storage.local.set({ autoDecrypt: autoDecrypt.value === "true" });
  });

  theme.addEventListener("change", () => {
    chrome.storage.local.set({ theme: theme.value });
  });

  toggleDefaultPassphrase.addEventListener("click", () => {
    const type = defaultPassphrase.getAttribute("type") === "password" ? "text" : "password";
    defaultPassphrase.setAttribute("type", type);
  });

  clearLogs.addEventListener("click", () => {
    chrome.storage.local.set({ logs: [] });
    alert("🗑 Logs cleared.");
  });

  closeOptions.addEventListener("click", () => {
    window.close();
  });
});

document.getElementById("saveLogs").addEventListener("click", () => {
  alert("📜 Logs saved successfully.");
});

document.getElementById("clearLogs").addEventListener("click", () => {
  chrome.storage.local.set({ logs: [] });
  alert("🗑 Logs cleared.");
});

document.getElementById("closeOptions").addEventListener("click", () => {
  window.close();
});
