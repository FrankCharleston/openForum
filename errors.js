// errors.js
document.addEventListener("DOMContentLoaded", () => {
    // Retrieve a string called "errorLog" from local storage (or an array, if that's how you're storing it)
    chrome.storage.local.get("errorLog", (data) => {
      const logElement = document.getElementById("errorLog");
  
      if (data.errorLog) {
        // If "errorLog" is a simple string, display it directly
        // If it's an array, you can join or format it here
        logElement.textContent = data.errorLog;
      } else {
        logElement.textContent = "No errors found.";
      }
    });
  });
  