document.addEventListener("DOMContentLoaded", function () {
    const decryptButton = document.getElementById("decryptInput");
    const toggleButton = document.getElementById("toggle");
    const inputField = document.getElementById("textInput");
    const logContainer = document.getElementById("logContainer");

    // Toggle decryption on page
    toggleButton.addEventListener("click", function () {
        chrome.runtime.sendMessage({ action: "toggleDecryption" }, (response) => {
            if (chrome.runtime.lastError) {
                logToPopup(`❌ Error: ${chrome.runtime.lastError.message}`, "error");
            } else {
                logToPopup("✅ Decryption toggled successfully.", "log");
            }
        });
    });

    // Decrypt manually entered text
    decryptButton.addEventListener("click", function () {
        const text = inputField.value.trim();
        if (!text) {
            logToPopup("⚠️ No input text provided.", "warn");
            return;
        }

        chrome.runtime.sendMessage({ action: "decryptText", text: text }, (response) => {
            if (response && response.success) {
                inputField.value = response.decryptedText;
                logToPopup("✅ Decryption successful!", "log");
            } else {
                logToPopup("❌ Decryption failed. Check your passphrase.", "error");
            }
        });
    });
});

function logToPopup(message, type = "log") {
    const logContainer = document.getElementById("logContainer");
    if (!logContainer) return;

    const logEntry = document.createElement("div");
    logEntry.classList.add(type);
    logEntry.innerText = `[${type.toUpperCase()}] ${message}`;
    logContainer.appendChild(logEntry);
}
