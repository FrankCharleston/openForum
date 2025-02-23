/*********************************************************
 * content_script.js
 *
 * 1) Reads "autoDecrypt" & "debugMode" from storage
 * 2) If autoDecrypt is true, decrypt page on load
 * 3) Listens for messages (toggleDecryption, decryptText)
 * 4) Dynamically loads crypto-js if needed
 * 5) Defines and uses encryptText/decryptText
 * 6) Replaces ENC[...] blocks with decrypted text
 * 7) Applies theme
 * 8) Adds optional “Decrypt Page” button and animations
 *********************************************************/

// Global flags set after reading storage
let DEBUG_MODE = false;
let AUTO_DECRYPT = false;

// =============== CRYPTO UTILS ===============
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
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    if (DEBUG_MODE) {
      logDebug("[DEBUG] Decryption failed: Malformed UTF-8 data");
    }
    logDecryptionError(new Error("Malformed UTF-8 data"));
    return null;
  }
}

// =============== 1) READ SETTINGS ===============
chrome.storage.local.get(["autoDecrypt", "debugMode", "theme"], (data) => {
  AUTO_DECRYPT = data.autoDecrypt || false;
  DEBUG_MODE   = data.debugMode   || false;

  if (DEBUG_MODE) {
    attachDebugListeners();
    logDebug("[INFO] Debug mode is ON in content script.");
  }

  // Apply theme (light/dark/system)
  applyTheme(data.theme || "system");

  // If auto-decrypt is enabled, run the page decryption
  if (AUTO_DECRYPT) {
    if (DEBUG_MODE) logDebug("[INFO] Auto-decryption is ON. Scanning page...");
    scanAndDecryptPage();
  } else {
    if (DEBUG_MODE) logDebug("[INFO] Auto-decryption is OFF.");
  }
});

// =============== 2) LISTEN FOR MESSAGES ===============
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (DEBUG_MODE) logDebug("[DEBUG] Received message:", message);

  if (message.action === "toggleDecryption") {
    // Manually trigger a page scan
    scanAndDecryptPage();
    sendResponse({ status: "Decryption triggered" });
  } 
  else if (message.action === "decryptText") {
    // Decrypt a single text string from outside (popup, background, etc.)
    loadCryptoJS().then(() => {
      chrome.storage.local.get(["defaultPassphrase"], (data) => {
        const storedPassphrase = data.defaultPassphrase || "";
        const userPassphrase = storedPassphrase || prompt("Enter decryption passphrase:");
        if (!userPassphrase) {
          sendResponse({ success: false, decryptedText: null });
          return;
        }
        const decryptedText = decryptText(message.text, userPassphrase);
        sendResponse({ success: !!decryptedText, decryptedText });
      });
    });
    return true; // indicates we'll respond asynchronously
  }
});

// =============== 4) SCAN & DECRYPT PAGE ===============
async function scanAndDecryptPage() {
  if (DEBUG_MODE) logDebug("[INFO] Starting scanAndDecryptPage...");
  await loadCryptoJS();

  // Retrieve defaultPassphrase from storage
  chrome.storage.local.get("defaultPassphrase", (data) => {
    const storedPassphrase = data.defaultPassphrase || "";
    // If there's no stored passphrase, prompt the user
    const passphrase = storedPassphrase || prompt("Enter passphrase to decrypt:");
    if (!passphrase) {
      if (DEBUG_MODE) logDebug("[WARN] No passphrase provided. Aborting decryption.");
      return;
    }

    // Use a TreeWalker to find all text nodes in <body> containing ENC[...]
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
      const textContent = node.nodeValue;
      if (!textContent || !textContent.includes("ENC[")) continue;

      const encRegex = /ENC\[(.*?)\]/g;
      let replacedText   = textContent;
      let match;
      let foundEncrypted = false;

      while ((match = encRegex.exec(textContent)) !== null) {
        const encryptedChunk = match[1];
        let decrypted;
        try {
          decrypted = decryptText(encryptedChunk, passphrase);
        } catch (error) {
          logDecryptionError(error);
          console.error("[ERROR] Decryption failed:", error);
          continue;
        }

        if (decrypted) {
          foundEncrypted = true;
          replacedText = replacedText.replace(`ENC[${encryptedChunk}]`, `🔓${decrypted}`);
        } else if (DEBUG_MODE) {
          logDebug("[INFO] Decryption failed for chunk:", encryptedChunk);
        }
      }

      // If at least one chunk was successfully decrypted, update the node
      if (foundEncrypted) {
        node.nodeValue = replacedText;
      }
    }

    if (DEBUG_MODE) logDebug("[INFO] Finished scanning/decrypting.");
  });
}

// =============== 5) DYNAMICALLY LOAD CRYPTO-JS ===============
async function loadCryptoJS() {
  // If CryptoJS is not defined, inject it
  if (typeof CryptoJS === "undefined") {
    if (DEBUG_MODE) logDebug("[INFO] Injecting crypto-js.min.js...");
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("lib/crypto-js.min.js");
    document.head.appendChild(script);

    await new Promise(resolve => (script.onload = resolve));
    if (DEBUG_MODE) logDebug("[INFO] crypto-js.min.js loaded.");
  }

  // Define encryption/decryption globally if needed
  if (typeof window.encryptText === "undefined") {
    window.encryptText = encryptText;
  }
  if (typeof window.decryptText === "undefined") {
    window.decryptText = decryptText;
  }
}

// =============== LOG DECRYPTION ERRORS ===============
function logDecryptionError(error) {
  try {
    chrome.storage.local.get("decryptionErrors", (data) => {
      let errors = data.decryptionErrors || [];
      errors.push({
        timestamp: new Date().toISOString(),
        error: error.message || "Unknown error"
      });
      chrome.storage.local.set({ decryptionErrors: errors });
      if (DEBUG_MODE) logDebug(`[DEBUG] Decryption error logged: ${error.message}`);
    });
  } catch (e) {
    console.error("[ERROR] Failed to log decryption error:", e);
  }
}

// =============== THEME HANDLER ===============
function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    document.body.classList.remove("light-mode");
  } else if (theme === "light") {
    document.body.classList.add("light-mode");
    document.body.classList.remove("dark-mode");
  } else {
    // System default
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) {
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
    } else {
      document.body.classList.add("light-mode");
      document.body.classList.remove("dark-mode");
    }
  }
  if (DEBUG_MODE) logDebug(`[DEBUG] Theme applied: ${theme}`);
}

// =============== OPTIONAL UI ELEMENTS ===============
function addDynamicElements() {
  const decryptButton = document.createElement("button");
  decryptButton.innerText = "Decrypt Page";
  decryptButton.style.position = "fixed";
  decryptButton.style.bottom = "10px";
  decryptButton.style.right = "10px";
  decryptButton.style.padding = "10px 20px";
  decryptButton.style.backgroundColor = "#4CAF50";
  decryptButton.style.color = "white";
  decryptButton.style.border = "none";
  decryptButton.style.borderRadius = "5px";
  decryptButton.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
  decryptButton.style.cursor = "pointer";
  decryptButton.style.zIndex = "1000";

  decryptButton.addEventListener("click", () => {
    scanAndDecryptPage();
  });

  document.body.appendChild(decryptButton);
}

function addAnimations() {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    .fade-in {
      animation: fadeIn 0.5s ease-in-out;
    }
  `;
  document.head.appendChild(style);
}

// Run once DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  addDynamicElements();
  addAnimations();
});

// =============== LOG DEBUG MESSAGES ===============
function logDebug(message) {
  const timestamp = new Date().toISOString();
  console.log(`[DEBUG] ${timestamp} - ${message}`);
}
