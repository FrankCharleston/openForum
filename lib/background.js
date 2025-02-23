/*****************************************************
 * background.js - Right Click Encryption/Decryption *
 *****************************************************/

// ====== Crypto Utility Functions ======
function hashPassphrase(passphrase) {
  return CryptoJS.SHA256(passphrase).toString();
}

function encryptText(text, passphrase) {
  const hashed = hashPassphrase(passphrase);
  return CryptoJS.AES.encrypt(text, hashed).toString();
}

function decryptText(encryptedText, passphrase) {
  const hashed = hashPassphrase(passphrase);
  const bytes  = CryptoJS.AES.decrypt(encryptedText, hashed);

  try {
    // Convert to UTF-8
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.error("[DEBUG] Decryption error:", err);
    // Return null so caller can handle the error
    return null;
  }
}

// ====== 1) Create Context Menus on Install ======
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

// ====== 2) Handle Context Menu Clicks ======
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) {
    console.error("Cannot access chrome:// and edge:// URLs");
    return;
  }

  if (info.menuItemId === "encryptText") {
    injectAndExecuteScript(tab.id, encryptSelectedText, info.selectionText);
  } else if (info.menuItemId === "decryptText") {
    injectAndExecuteScript(tab.id, decryptSelectedText, info.selectionText);
  }
});

// ====== 3) Listen for Storage Changes to Update the Icon ======
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.autoDecrypt) {
    updateIcon(changes.autoDecrypt.newValue);
  }
});

// ====== 4) Update Extension Icon ======
function updateIcon(autoDecryptEnabled) {
  const iconPath = autoDecryptEnabled
    ? {
        "16": "../assets/icon-enabled-16.png",
        "48": "../assets/icon-enabled-48.png",
        "128": "../assets/icon-enabled-128.png"
      }
    : {
        "16": "../assets/icon-16.png",
        "48": "../assets/icon-48.png",
        "128": "../assets/icon-128.png"
      };

  console.log("[INFO] Setting icon to:", iconPath);

  chrome.action.setIcon({ path: iconPath }, () => {
    if (chrome.runtime.lastError) {
      console.error("[ERROR] Setting icon:", chrome.runtime.lastError.message);
    }
  });
}

// ====== 5) Inject CryptoJS, then Execute the Given Function ======
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

// ====== 6) Encrypt Selected Text ======
function encryptSelectedText(text) {
  if (!text || text.trim() === "") {
    alert("No text selected for encryption.");
    return;
  }

  // Retrieve defaultPassphrase or redditUsername
  chrome.storage.local.get(["defaultPassphrase", "redditUsername"], (data) => {
    // Fallback to redditUsername or defaultPassphrase, else prompt
    let passphrase = data.defaultPassphrase || data.redditUsername;
    if (!passphrase) {
      passphrase = prompt("Enter passphrase to encrypt:");
      if (!passphrase) return; // user cancelled
    }

    const encrypted = encryptText(text.trim(), passphrase);
    const formattedMessage = `ENC[${encrypted}]\n\n🔐 Securely encrypted with OpenForum`;

    navigator.clipboard
      .writeText(formattedMessage)
      .then(() => {
        alert("Encrypted text copied to clipboard.");
      })
      .catch((error) => {
        console.error("[ERROR] Failed to copy encrypted text:", error);
        alert("Failed to copy encrypted text.");
      });
  });
}

// ====== 7) Decrypt Selected Text ======
function decryptSelectedText(text) {
  if (!text || !text.startsWith("ENC[")) {
    alert("No valid encrypted text selected (must start with ENC[ ).");
    return;
  }

  chrome.storage.local.get(["defaultPassphrase", "redditUsername"], (data) => {
    let passphrase = data.defaultPassphrase || data.redditUsername;
    if (!passphrase) {
      passphrase = prompt("Enter passphrase to decrypt:");
      if (!passphrase) return; // user cancelled
    }

    try {
      // Strip ENC[...] wrapper
      const rawCipher = text.replace(/^ENC\[/, "").replace(/\]$/, "").trim();
      const decrypted = decryptText(rawCipher, passphrase);

      if (decrypted) {
        alert("Decrypted Text: " + decrypted);
      } else {
        alert("Decryption failed. Incorrect passphrase or invalid data.");
        logDecryptionError(new Error("Incorrect passphrase or invalid data"));
      }
    } catch (error) {
      if (error.message && error.message.includes("Malformed UTF-8 data")) {
        console.error("[ERROR] Decryption failed: Malformed UTF-8 data");
        logDecryptionError(new Error("Corrupted data"));
      } else {
        logDecryptionError(error);
      }
      alert("Decryption error. Ensure the text is correctly formatted.");
    }
  });
}

// ====== Log Decryption Errors to Storage ======
function logDecryptionError(error) {
  try {
    chrome.storage.local.get("decryptionErrors", (data) => {
      const errors = data.decryptionErrors || [];
      errors.push({
        timestamp: new Date().toISOString(),
        error: error.message || "Unknown error"
      });
      chrome.storage.local.set({ decryptionErrors: errors });
    });
  } catch (e) {
    console.error("[ERROR] Failed to log decryption error:", e);
  }
}

// ====== Decrypt Text on Page Load ======
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.storage.local.get(['autoDecrypt', 'defaultPassphrase'], (data) => {
      if (data.autoDecrypt && data.defaultPassphrase) {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: decryptPageContent,
          args: [data.defaultPassphrase]
        });
      }
    });
  }
});

function decryptPageContent(passphrase) {
  const elements = document.querySelectorAll('p, span, div');
  elements.forEach(element => {
    const text = element.innerText;
    if (text.startsWith('ENC[')) {
      const rawCipher = text.replace(/^ENC\[/, "").replace(/\]$/, "").trim();
      const decrypted = decryptText(rawCipher, passphrase);
      if (decrypted) {
        element.innerText = decrypted;
      }
    }
  });
}
