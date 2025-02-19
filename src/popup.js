/* ==============================
   📌 popup.js - Handles UI Actions
   ============================== */

   document.addEventListener("DOMContentLoaded", function () {
    const logContainer = document.getElementById("logContainer");
    const toggleButton = document.getElementById("toggleDecryption");

    // Function to log messages to the popup UI
    function logMessage(message) {
        const logEntry = document.createElement("div");
        logEntry.textContent = `[LOG] ${message}`;
        logContainer.appendChild(logEntry);
    }

    // Toggle decryption when button is clicked
    toggleButton.addEventListener("click", function () {
        logMessage("Toggle Decryption button clicked");

        chrome.runtime.sendMessage({ action: "toggleDecryption" }, function (response) {
            if (chrome.runtime.lastError) {
                logMessage("Error: " + chrome.runtime.lastError.message);
            } else {
                logMessage("Response: " + JSON.stringify(response));
            }
        });
    });

    // Listen for logs from content scripts
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === "log") {
            logMessage(message.content);
        }
    });
});
