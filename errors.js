// errors.js
document.addEventListener("DOMContentLoaded", () => {
  // Retrieve decryption errors from local storage
  chrome.storage.local.get("decryptionErrors", (data) => {
    const logElement = document.getElementById("errorLog");
    const errors = data.decryptionErrors || [];

    if (errors.length === 0) {
      logElement.textContent = "No errors found.";
      return;
    }

    // Format each error entry. Example structure: { timestamp, error }
    const formattedErrors = errors.map(err => {
      return `[${err.timestamp}] ${err.error}`;
    }).join("\n\n");

    logElement.textContent = formattedErrors;
  });
});
