// options.js
document.addEventListener("DOMContentLoaded", () => {
  const autoDecryptToggle = document.getElementById("autoDecryptToggle");
  const customPassphraseInput = document.getElementById("customPassphrase");
  const debugToggle = document.getElementById("debugToggle");
  const saveButton = document.getElementById("saveSettings");
  const statusMessage = document.getElementById("statusMessage");

  // Load current settings
  chrome.storage.local.get(["autoDecrypt", "defaultPassphrase", "debugMode"], (data) => {
    autoDecryptToggle.checked = data.autoDecrypt || false;
    customPassphraseInput.value = data.defaultPassphrase || "";
    debugToggle.checked = data.debugMode || false;
  });

  // Save settings
  saveButton.addEventListener("click", () => {
    const autoDecrypt = autoDecryptToggle.checked;
    const defaultPassphrase = customPassphraseInput.value.trim();
    const debugMode = debugToggle.checked;

    chrome.storage.local.set({ autoDecrypt, defaultPassphrase, debugMode }, () => {
      statusMessage.innerText = "✅ Settings saved!";
      setTimeout(() => (statusMessage.innerText = ""), 2000);

      // Optional: update extension badge
      chrome.action.setBadgeText({ text: autoDecrypt ? "ON" : "OFF" });
      chrome.action.setBadgeBackgroundColor({
        color: autoDecrypt ? "#4CAF50" : "#F44336",
      });

      if (debugMode) {
        console.log("[DEBUG] Debug mode enabled in extension settings.");
      }
    });
  });
});
