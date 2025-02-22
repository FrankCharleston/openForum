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
});

// 2) Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "encryptText") {
    // Inject crypto-js then run encryption
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        files: ["crypto-js.min.js"]
      },
      () => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: encryptSelectedText,
          args: [info.selectionText]
        });
      }
    );
  } else if (info.menuItemId === "decryptText") {
    // Inject crypto-js then run decryption
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        files: ["crypto-js.min.js"]
      },
      () => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: decryptSelectedText,
          args: [info.selectionText]
        });
      }
    );
  }
});

/**
 * encryptSelectedText(text)
 * Prompts for passphrase, encrypts, copies to clipboard
 * Includes "🔐 Securely encrypted with OpenForum"
 */
function encryptSelectedText(text) {
  if (!text || text.trim() === "") {
    alert("No text selected for encryption.");
    return;
  }
  let passphrase = prompt("Enter passphrase to encrypt:");
  if (!passphrase) return;

  let encrypted = CryptoJS.AES.encrypt(text.trim(), passphrase).toString();
  let formattedMessage = `ENC[${encrypted}]\n\n🔐 Securely encrypted with OpenForum`;

  navigator.clipboard.writeText(formattedMessage).then(() => {
    alert("Encrypted text copied to clipboard.");
  }).catch(() => {
    alert("Failed to copy encrypted text.");
  });
}

/**
 * decryptSelectedText(text)
 * Tries defaultPassphrase from storage or prompts
 * Logs errors to storage if decryption fails
 */
function decryptSelectedText(text) {
  if (!text || !text.startsWith("ENC[")) {
    alert("No valid encrypted text selected.");
    return;
  }
  // 1) Try reading defaultPassphrase from storage
  chrome.storage.local.get("defaultPassphrase", (data) => {
    let storedPassphrase = data.defaultPassphrase;
    let passphrase = storedPassphrase || prompt("Enter passphrase to decrypt:");
    if (!passphrase) return;

    try {
      let encryptedData = text.replace("ENC[", "").replace("]", "").trim();
      let bytes = CryptoJS.AES.decrypt(encryptedData, passphrase);
      let decrypted = bytes.toString(CryptoJS.enc.Utf8);

      if (decrypted) {
        alert("Decrypted Text: " + decrypted);
      } else {
        alert("Decryption failed. Incorrect passphrase or corrupted data.");
      }
    } catch (error) {
      console.error("Decryption failed:", error);
      chrome.storage.local.get("decryptionErrors", (errData) => {
        let errors = errData.decryptionErrors || [];
        errors.push({ timestamp: new Date().toISOString(), error: error.message });
        chrome.storage.local.set({ decryptionErrors: errors });
      });
      alert("Decryption error. Ensure the text is correctly formatted.");
    }
  });
}
