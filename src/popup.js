document.getElementById("toggle").addEventListener("click", function () {
    chrome.runtime.sendMessage({ action: "toggleDecryption" }, (response) => {
        if (chrome.runtime.lastError) {
            logToPopup(`❌ Error: ${chrome.runtime.lastError.message}`, "error");
        } else {
            logToPopup("✅ Decryption toggled successfully.", "log");
        }
    });
});

function logToPopup(message, type = "log") {
    const logContainer = document.getElementById("logContainer");
    if (!logContainer) {
        console.warn("[WARN] Log container not found.");
        return;
    }

    const logEntry = document.createElement("div");
    logEntry.classList.add(type);
    logEntry.innerText = `[${type.toUpperCase()}] ${message}`;
    logContainer.appendChild(logEntry);
}
