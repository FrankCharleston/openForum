document.addEventListener("DOMContentLoaded", () => {
  const autoDecrypt = document.getElementById("autoDecrypt");
  const defaultPassphrase = document.getElementById("defaultPassphrase");
  const theme = document.getElementById("theme");
  const saveOptions = document.getElementById("saveOptions");
  const clearLogs = document.getElementById("clearLogs");
  const saveLogs = document.getElementById("saveLogs");
  const closeOptions = document.getElementById("closeOptions");
  const toggleDefaultPassphrase = document.getElementById("toggleDefaultPassphrase");

  // Load saved settings from storage
  chrome.storage.local.get(["autoDecrypt", "defaultPassphrase", "theme"], (data) => {
    autoDecrypt.value = data.autoDecrypt ? "true" : "false";
    defaultPassphrase.value = data.defaultPassphrase || "";

    // Default to system theme if no user setting is found
    if (data.theme) {
      theme.value = data.theme;
      applyTheme(data.theme);
    } else {
      theme.value = "system";
      applyTheme("system");
    }
  });

  // Save settings to storage
  saveOptions.addEventListener("click", () => {
    chrome.storage.local.set({
      autoDecrypt: autoDecrypt.value === "true",
      defaultPassphrase: defaultPassphrase.value,
      theme: theme.value
    });
    alert("💾 Settings saved!");
    applyTheme(theme.value); // Apply theme immediately
  });

  // Toggle passphrase visibility
  toggleDefaultPassphrase.addEventListener("click", () => {
    const type = defaultPassphrase.getAttribute("type") === "password" ? "text" : "password";
    defaultPassphrase.setAttribute("type", type);
  });

  // Clear logs
  clearLogs.addEventListener("click", () => {
    chrome.storage.local.set({ logs: [] });
    alert("🗑 Logs cleared.");
  });

  // Export logs to a .txt file
  saveLogs.addEventListener("click", () => {
    chrome.storage.local.get("logs", (data) => {
      const logs = data.logs || [];
      if (logs.length === 0) {
        alert("📜 No logs to export.");
        return;
      }

      const logContent = logs.map(entry => `[${entry.timestamp}] ${entry.message}`).join("\n");
      const blob = new Blob([logContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "OpenForum_Logs.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert("📜 Logs exported successfully!");
    });
  });

  // Close options page
  closeOptions.addEventListener("click", () => {
    window.close();
  });

  // Apply theme settings dynamically
  theme.addEventListener("change", () => {
    applyTheme(theme.value);
  });

  function applyTheme(selectedTheme) {
    let appliedTheme = selectedTheme;
    if (selectedTheme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      appliedTheme = prefersDark ? "dark" : "light";
    }
    document.body.classList.toggle("dark-mode", appliedTheme === "dark");
    document.body.classList.toggle("light-mode", appliedTheme === "light");
  }
});
