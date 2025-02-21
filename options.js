document.addEventListener("DOMContentLoaded", function () {
    const autoDecryptToggle = document.getElementById("autoDecryptToggle");
    const customPassphraseInput = document.getElementById("customPassphrase");
    const saveButton = document.getElementById("saveSettings");
    const statusMessage = document.getElementById("statusMessage");

    // Load saved settings
    chrome.storage.local.get(["autoDecrypt", "defaultPassphrase"], (data) => {
        autoDecryptToggle.checked = data.autoDecrypt || false;
        customPassphraseInput.value = data.defaultPassphrase || "";
    });

    // Save settings
    saveButton.addEventListener("click", () => {
        const autoDecrypt = autoDecryptToggle.checked;
        const defaultPassphrase = customPassphraseInput.value.trim();

        chrome.storage.local.set({ autoDecrypt, defaultPassphrase }, () => {
            statusMessage.innerText = "✅ Settings saved!";
            setTimeout(() => statusMessage.innerText = "", 2000);

            // Update the extension badge
            chrome.action.setBadgeText({ text: autoDecrypt ? "ON" : "OFF" });
            chrome.action.setBadgeBackgroundColor({ color: autoDecrypt ? "#4CAF50" : "#F44336" });
        });
    });
});
