document.getElementById("toggle").addEventListener("click", () => {
  console.log("[DEBUG] Toggle button clicked, sending message to content script...");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
          console.error("[ERROR] No active tab found.");
          return;
      }

      chrome.tabs.sendMessage(tabs[0].id, { action: "toggleDecryption" }, (response) => {
          if (chrome.runtime.lastError) {
              console.error("[ERROR] Could not send message to content script:", chrome.runtime.lastError.message);
          } else {
              console.log("[DEBUG] Message sent successfully. Response:", response);
          }
      });
  });
});
