document.getElementById("toggle").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "toggleDecryption" });
    });
});
  

chrome.storage.local.get("log", (data) => {
    document.getElementById("log").innerText = data.log || "No logs yet...";
});

