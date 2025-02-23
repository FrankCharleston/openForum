document.addEventListener("DOMContentLoaded", function () {
  const autoDecryptToggle = document.getElementById("autoDecryptToggle");
  const customPassphrase = document.getElementById("customPassphrase");
  const debugToggle = document.getElementById("debugToggle");
  const saveSettings = document.getElementById("saveSettings");
  const statusMessage = document.getElementById("statusMessage");

  // Load settings from storage and update UI
  chrome.storage.local.get(["autoDecrypt", "defaultPassphrase", "debugMode"], (data) => {
    autoDecryptToggle.checked = data.autoDecrypt || false;
    customPassphrase.value = data.defaultPassphrase || "";
    debugToggle.checked = data.debugMode || false;
  });

  // Save settings to storage
  saveSettings.addEventListener("click", () => {
    const autoDecrypt = autoDecryptToggle.checked;
    const defaultPassphrase = customPassphrase.value.trim();
    const debugMode = debugToggle.checked;

    chrome.storage.local.set({
      autoDecrypt,
      defaultPassphrase,
      debugMode
    }, () => {
      showStatus("Settings saved successfully!", "success");
    });
  });

  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = type;
    setTimeout(() => {
      statusMessage.textContent = "";
      statusMessage.className = "";
    }, 3000);
  }
});