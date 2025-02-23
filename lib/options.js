document.addEventListener("DOMContentLoaded", function () {
  const autoDecryptToggle = document.getElementById("autoDecryptToggle");
  const autoDecryptIndicator = document.getElementById("autoDecryptIndicator");
  const customPassphrase = document.getElementById("customPassphrase");
  const debugToggle = document.getElementById("debugToggle");
  const redditUsernameToggle = document.getElementById("redditUsernameToggle");
  const saveSettings = document.getElementById("saveSettings");
  const statusMessage = document.getElementById("statusMessage");
  const logList = document.getElementById("logList");
  const clearLogBtn = document.getElementById("clearLogBtn");

  // Load settings from storage and update UI
  chrome.storage.local.get(["autoDecrypt", "defaultPassphrase", "debugMode", "redditUsername", "logs"], (data) => {
    autoDecryptToggle.checked = data.autoDecrypt || false;
    customPassphrase.value = data.defaultPassphrase || "";
    debugToggle.checked = data.debugMode || false;
    redditUsernameToggle.checked = data.redditUsername || false;
    updateAutoDecryptIndicator(autoDecryptToggle.checked);
    updateLogList(data.logs || []);
  });

  // Save settings to storage
  saveSettings.addEventListener("click", () => {
    const autoDecrypt = autoDecryptToggle.checked;
    const defaultPassphrase = customPassphrase.value.trim();
    const debugMode = debugToggle.checked;
    const redditUsername = redditUsernameToggle.checked;

    chrome.storage.local.set({
      autoDecrypt,
      defaultPassphrase,
      debugMode,
      redditUsername
    }, () => {
      showStatus("Settings saved successfully!", "success");
      updateAutoDecryptIndicator(autoDecrypt);
    });
  });

  // Clear logs from storage
  clearLogBtn.addEventListener("click", () => {
    chrome.storage.local.set({ logs: [] }, () => {
      updateLogList([]);
      showStatus("Logs cleared successfully!", "success");
    });
  });

  // Update auto-decrypt indicator
  autoDecryptToggle.addEventListener("change", () => {
    updateAutoDecryptIndicator(autoDecryptToggle.checked);
  });

  function updateAutoDecryptIndicator(isEnabled) {
    autoDecryptIndicator.textContent = isEnabled ? "🔓" : "🔒";
  }

  function updateLogList(logs) {
    logList.innerHTML = "";
    logs.forEach(log => {
      const logItem = document.createElement("li");
      logItem.textContent = log;
      logList.appendChild(logItem);
    });
  }

  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = type;
    setTimeout(() => {
      statusMessage.textContent = "";
      statusMessage.className = "";
    }, 3000);
  }
});