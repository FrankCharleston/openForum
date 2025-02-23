/*****************************************************
 * background.js - Right Click Encryption/Decryption *
 *****************************************************/

// 1) Create context menus on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "encryptText",
    title: "Encrypt Selected Text",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "decryptText",
    title: "Decrypt Selected Text",
    contexts: ["selection"]
  });

  console.log("[INFO] Context menus created.");

  // Set the initial icon based on autoDecrypt setting
  chrome.storage.local.get("autoDecrypt", (data) => {
    updateIcon(data.autoDecrypt);
  });
});

// 2) Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "encryptText") {
    injectAndExecuteScript(tab.id, encryptSelectedText, info.selectionText);
  } else if (info.menuItemId === "decryptText") {
    injectAndExecuteScript(tab.id, decryptSelectedText, info.selectionText);
  }
});

// 3) Listen for storage changes to update the icon
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.autoDecrypt) {
    updateIcon(changes.autoDecrypt.newValue);
  }
});

// 4) Function to update the extension icon
function updateIcon(autoDecryptEnabled) {
  const iconPath = autoDecryptEnabled ? {
    "16": "../assets/icon-enabled-16.png",
    "48": "../assets/icon-enabled-48.png",
    "128": "../assets/icon-enabled-128.png"
  } : {
    "16": "../assets/icon-16.png",
    "48": "../assets/icon-48.png",
    "128": "../assets/icon-128.png"
  };
  console.log("Setting icon to:", iconPath);
  chrome.action.setIcon({ path: iconPath }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error setting icon:", chrome.runtime.lastError.message);
    }
  });
}

// 5) Inject and execute script in the active tab
function injectAndExecuteScript(tabId, func, args) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      files: ["lib/crypto-js.min.js"]
    },
    () => {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: func,
        args: [args]
      });
    }
  );
}

const { encryptText, decryptText } = require('./crypto-utils');

// 6) Encrypt selected text
function encryptSelectedText(text) {
  if (!text || text.trim() === "") {
    alert("No text selected for encryption.");
    return;
  }
  chrome.storage.local.get("redditUsername", (data) => {
    let passphrase = data.redditUsername || prompt("Enter passphrase to encrypt:");
    if (!passphrase) return;

    let encrypted = encryptText(text.trim(), passphrase);
    let formattedMessage = `ENC[${encrypted}]\n\n🔐 Securely encrypted with OpenForum`;

    navigator.clipboard.writeText(formattedMessage).then(() => {
      alert("Encrypted text copied to clipboard.");
    }).catch((error) => {
      console.error("Failed to copy encrypted text:", error);
      alert("Failed to copy encrypted text.");
    });
  });
}

// 7) Decrypt selected text
function decryptSelectedText(text) {
  if (!text || !text.startsWith("ENC[")) {
    alert("No valid encrypted text selected.");
    return;
  }
  // 1) Try reading defaultPassphrase from storage
  chrome.storage.local.get(["defaultPassphrase", "redditUsername"], (data) => {
    let storedPassphrase = data.defaultPassphrase;
    let passphrase = data.redditUsername || storedPassphrase || prompt("Enter passphrase to decrypt:");
    if (!passphrase) return;

    try {
      let encryptedData = text.replace("ENC[", "").replace("]", "").trim();
      let decrypted = decryptText(encryptedData, passphrase);

      if (decrypted) {
        alert("Decrypted Text: " + decrypted);
      } else {
        alert("Decryption failed. Incorrect passphrase.");
        logDecryptionError(new Error("Incorrect passphrase"));
      }
    } catch (error) {
      if (error.message.includes("Malformed UTF-8 data")) {
        console.error("Decryption failed: Malformed UTF-8 data");
        logDecryptionError(new Error("Corrupted data"));
      } else {
        logDecryptionError(error);
      }
      alert("Decryption error. Ensure the text is correctly formatted.");
    }
  });
}