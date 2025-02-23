chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("autoDecrypt", (data) => {
    updateIcon(data.autoDecrypt);
  });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.autoDecrypt) {
    updateIcon(changes.autoDecrypt.newValue);
  }
});

function updateIcon(autoDecryptEnabled) {
  const iconPath = autoDecryptEnabled ? {
    "16": "assets/icon-enabled-16.png",
    "48": "assets/icon-enabled-48.png",
    "128": "assets/icon-enabled-128.png"
  } : {
    "16": "assets/icon-16.png",
    "48": "assets/icon-48.png",
    "128": "assets/icon-128.png"
  };
  console.log("Setting icon to:", iconPath);
  chrome.action.setIcon({ path: iconPath }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error setting icon:", chrome.runtime.lastError.message);
    }
  });
}