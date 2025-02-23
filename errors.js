document.addEventListener("DOMContentLoaded", function () {
  const errorLog = document.getElementById("errorLog");
  const clearErrors = document.getElementById("clearErrors");

  // Load errors from storage and display them
  chrome.storage.local.get("decryptionErrors", (data) => {
    const errors = data.decryptionErrors || [];
    if (errors.length === 0) {
      errorLog.textContent = "No decryption errors found.";
    } else {
      errorLog.textContent = errors.map(error => `${error.timestamp}: ${error.error}`).join("\n");
    }
  });

  // Clear errors from storage
  clearErrors.addEventListener("click", () => {
    chrome.storage.local.set({ decryptionErrors: [] }, () => {
      errorLog.textContent = "No decryption errors found.";
    });
  });
});