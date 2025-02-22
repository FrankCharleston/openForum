// options.js
document.addEventListener("DOMContentLoaded", function () {
  const autoDecryptToggle = document.getElementById("autoDecryptToggle");
  const customPassphraseInput = document.getElementById("customPassphrase");
  const debugToggle = document.getElementById("debugToggle");
  const saveButton = document.getElementById("saveSettings");
  const statusMessage = document.getElementById("statusMessage");

  // Load saved settings from chrome.storage
  chrome.storage.local.get(["autoDecrypt", "defaultPassphrase", "debugMode"], (data) => {
    autoDecryptToggle.checked = data.autoDecrypt || false;
    customPassphraseInput.value = data.defaultPassphrase || "";
    debugToggle.checked = data.debugMode || false;
  });

  // Save settings on button click
  saveButton.addEventListener("click", () => {
    const autoDecrypt = autoDecryptToggle.checked;
    const defaultPassphrase = customPassphraseInput.value.trim();
    const debugMode = debugToggle.checked;

    chrome.storage.local.set({ autoDecrypt, defaultPassphrase, debugMode }, () => {
      // Show success message
      statusMessage.innerText = "✅ Settings saved!";
      setTimeout(() => (statusMessage.innerText = ""), 2000);

      // Update the extension badge to reflect autoDecrypt ON/OFF
      chrome.action.setBadgeText({ text: autoDecrypt ? "ON" : "OFF" });
      chrome.action.setBadgeBackgroundColor({
        color: autoDecrypt ? "#4CAF50" : "#F44336",
      });

      // If you want to do something special for debug mode:
      if (debugMode) {
        console.log("[DEBUG] Debug mode is enabled in extension settings.");
      }
    });
  });
});
