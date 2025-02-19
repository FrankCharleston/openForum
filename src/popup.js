document.addEventListener("DOMContentLoaded", function () {
  const logContainer = document.getElementById("log");
  
  // Listen for logs from content script
  chrome.runtime.onMessage.addListener((message) => {
      if (message.type === "log") {
          logContainer.innerHTML += `<div>${message.content}</div>`;
      }
  });

  document.getElementById("toggle").addEventListener("click", function () {
      console.log("[DEBUG] Toggle button clicked");

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs.length === 0) {
              console.error("[ERROR] No active tab found.");
              return;
          }

          chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: () => console.log("[DEBUG] Content script is running.")
          }, () => {
              if (chrome.runtime.lastError) {
                  console.error("[ERROR] Content script injection failed:", chrome.runtime.lastError.message);
              } else {
                  console.log("[DEBUG] Sending message to content script...");
                  chrome.tabs.sendMessage(tabs[0].id, { action: "toggleDecryption" }, (response) => {
                      if (chrome.runtime.lastError) {
                          console.error("[ERROR] Could not send message to content script:", chrome.runtime.lastError.message);
                      } else {
                          console.log("[DEBUG] Message sent successfully. Response:", response);
                      }
                  });
              }
          });
      });
  });
});
