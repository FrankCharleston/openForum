document.addEventListener("DOMContentLoaded", () => {
  const autoDecrypt = document.getElementById("autoDecrypt");
  const defaultPassphrase = document.getElementById("defaultPassphrase");
  const theme = document.getElementById("theme");
  const saveSettings = document.getElementById("saveSettings");
  const saveLogs = document.getElementById("saveLogs");
  const clearLogs = document.getElementById("clearLogs");
  const closeOptions = document.getElementById("closeOptions");
  const toggleDefaultPassphrase = document.getElementById("toggleDefaultPassphrase");

  // Load settings from storage
  chrome.storage.local.get(["autoDecrypt", "defaultPassphrase", "theme"], (data) => {
    autoDecrypt.value = data.autoDecrypt ? "true" : "false";
    defaultPassphrase.value = data.defaultPassphrase || "";
    theme.value = data.theme || "system";
  });

  // Toggle Password Visibility
  toggleDefaultPassphrase.addEventListener("click", () => {
    const type = defaultPassphrase.getAttribute("type") === "password" ? "text" : "password";
    defaultPassphrase.setAttribute("type", type);
  });

  // Save settings on button click
  saveSettings.addEventListener("click", () => {
    chrome.storage.local.set({
      autoDecrypt: autoDecrypt.value === "true",
      defaultPassphrase: defaultPassphrase.value,
      theme: theme.value,
    }, () => {
      alert("💾 Settings saved successfully.");
    });
  });

  // Save logs (placeholder)
  saveLogs.addEventListener("click", () => {
    alert("📜 Logs saved successfully.");
  });

  // Clear logs
  clearLogs.addEventListener("click", () => {
    chrome.storage.local.set({ logs: [] }, () => {
      alert("🗑 Logs cleared.");
    });
  });

  // Close options page
  closeOptions.addEventListener("click", () => {
    window.close();
  });
});
