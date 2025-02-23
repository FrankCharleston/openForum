/*********************************************************
 * content_script.js
 *
 * 1) Reads "autoDecrypt", "debugMode", & "theme" from storage
 * 2) If autoDecrypt is true, decrypts the page on load
 * 3) Listens for messages (toggleDecryption, decryptText)
 * 4) Dynamically loads crypto-js if needed
 * 5) Defines and uses encryptText/decryptText utilities
 * 6) Replaces ENC[...] blocks with decrypted text
 * 7) Applies theme settings
 * 8) Adds an optional “Decrypt Page” button with animations
 *********************************************************/

// Global flags
let DEBUG_MODE = false;
let AUTO_DECRYPT = false;

/**
 * Helper function to promisify chrome.storage.local.get.
 * @param {string|string[]} keys 
 * @returns {Promise<object>}
 */
function getStorage(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) => resolve(result));
  });
}

// =============== CRYPTO UTILS ===============
function hashPassphrase(passphrase) {
  return CryptoJS.SHA256(passphrase).toString();
}

function encryptText(text, passphrase) {
  const hashed = hashPassphrase(passphrase);
  return CryptoJS.AES.encrypt(text, hashed).toString();
}

function decryptText(encryptedText, passphrase) {
  if (typeof CryptoJS === "undefined") {
    console.error("❌ CryptoJS is not loaded. Cannot decrypt.");
    return "⚠️ Decryption error: CryptoJS not available.";
  }

  const hashed = CryptoJS.SHA256(passphrase).toString();
  const bytes = CryptoJS.AES.decrypt(encryptedText, hashed);
  try {
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("❌ Decryption failed:", error);
    return "⚠️ Decryption error.";
  }
}


async function loadCryptoJS() {
  if (typeof CryptoJS === "undefined") {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = chrome.runtime.getURL("lib/crypto-js.min.js");
      script.onload = () => {
        console.log("✅ CryptoJS loaded successfully.");
        resolve();
      };
      document.head.appendChild(script);
    });
  }
  return Promise.resolve();
}

// =============== INITIALIZE SETTINGS ===============
(async function initSettings() {
  const data = await getStorage(["autoDecrypt", "debugMode", "theme"]);
  AUTO_DECRYPT = data.autoDecrypt || false;
  DEBUG_MODE   = data.debugMode   || false;

  if (DEBUG_MODE) {
    logDebug("Debug mode is ON in content script.");
  }

  // Apply the theme (light/dark/system)
  applyTheme(data.theme || "system");

  // If auto-decrypt is enabled, scan and decrypt the page
  if (AUTO_DECRYPT) {
    if (DEBUG_MODE) logDebug("Auto-decryption is ON. Scanning page...");
    scanAndDecryptPage();
  } else {
    if (DEBUG_MODE) logDebug("Auto-decryption is OFF.");
  }
})();

// =============== MESSAGE LISTENER ===============
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (DEBUG_MODE) logDebug("Received message: " + JSON.stringify(message));

  if (message.action === "toggleDecryption") {
    // Manually trigger page decryption
    scanAndDecryptPage();
    sendResponse({ status: "Decryption triggered" });
  } else if (message.action === "decryptText") {
    // Decrypt a single text string from outside (e.g. popup)
    loadCryptoJS().then(async () => {
      const data = await getStorage(["defaultPassphrase"]);
      const storedPassphrase = data.defaultPassphrase || "";
      const userPassphrase = storedPassphrase || prompt("Enter decryption passphrase:");
      if (!userPassphrase) {
        sendResponse({ success: false, decryptedText: null });
        return;
      }
      const decryptedText = decryptText(message.text, userPassphrase);
      sendResponse({ success: !!decryptedText, decryptedText });
    });
    return true; // indicates asynchronous response
  }
});

// =============== SCAN & DECRYPT PAGE ===============
async function scanAndDecryptPage() {
  await loadCryptoJS(); // Ensure CryptoJS is available before proceeding

  const data = await getStorage(["defaultPassphrase"]);
  const storedPassphrase = data.defaultPassphrase || "";
  const passphrase = storedPassphrase || prompt("Enter passphrase to decrypt:");
  if (!passphrase) return;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
  let node;
  while ((node = walker.nextNode())) {
    const textContent = node.nodeValue;
    if (!textContent || !textContent.includes("ENC[")) continue;

    const encRegex = /ENC\[(.*?)\]/g;
    let replacedText = textContent;
    let foundEncrypted = false;
    let match;
    while ((match = encRegex.exec(textContent)) !== null) {
      const encryptedChunk = match[1];
      let decrypted = decryptText(encryptedChunk, passphrase);
      if (decrypted) {
        foundEncrypted = true;
        replacedText = replacedText.replace(`ENC[${encryptedChunk}]`, `🔓${decrypted}`);
      }
    }
    if (foundEncrypted) {
      node.nodeValue = replacedText;
      node.parentElement.innerHTML = node.parentElement.innerHTML; // Force re-render
    }
  }
}



// =============== LOG DECRYPTION ERRORS ===============
function logDecryptionError(error) {
  getStorage("decryptionErrors")
    .then((data) => {
      let errors = data.decryptionErrors || [];
      errors.push({
        timestamp: new Date().toISOString(),
        error: error.message || "Unknown error"
      });
      chrome.storage.local.set({ decryptionErrors: errors });
      if (DEBUG_MODE) logDebug("Decryption error logged: " + error.message);
    })
    .catch((e) => {
      console.error("Failed to log decryption error:", e);
    });
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
  if (DEBUG_MODE) logDebug("Theme applied: " + theme);
}

// =============== OPTIONAL UI ELEMENTS ===============
function addDynamicElements() {
  const decryptButton = document.createElement("button");
  decryptButton.innerText = "Decrypt Page";
  Object.assign(decryptButton.style, {
    position: "fixed",
    bottom: "10px",
    right: "10px",
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    cursor: "pointer",
    zIndex: "1000"
  });
  decryptButton.addEventListener("click", scanAndDecryptPage);
  document.body.appendChild(decryptButton);
}

function addAnimations() {
  const style = document.createElement("style");
  style.textContent = `
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
