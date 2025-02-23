/*********************************************************
 * content_script.js
 * 
 * 1) Reads "autoDecrypt" & "debugMode" from storage
 * 2) If autoDecrypt is true, decrypt page on load
 * 3) Listens for messages (toggleDecryption, decryptText)
 * 4) Dynamically loads crypto-js if needed
 * 5) Defines and uses encryptText/decryptText
 * 6) Replaces ENC[...] blocks with decrypted text
 *********************************************************/

// We'll set these after reading storage
let DEBUG_MODE = false;
let AUTO_DECRYPT = false;

// Crypto utility functions
function hashPassphrase(passphrase) {
  return CryptoJS.SHA256(passphrase).toString();
}

function encryptText(text, passphrase) {
  const hashedPassphrase = hashPassphrase(passphrase);
  return CryptoJS.AES.encrypt(text, hashedPassphrase).toString();
}

function decryptText(encryptedText, passphrase) {
  const hashedPassphrase = hashPassphrase(passphrase);
  const bytes = CryptoJS.AES.decrypt(encryptedText, hashedPassphrase);
  try {
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    if (DEBUG_MODE) console.error("Decryption failed: Malformed UTF-8 data");
    logDecryptionError(new Error("Malformed UTF-8 data"));
    return null;
  }
}

// 1) Read settings from storage
chrome.storage.local.get(["autoDecrypt", "debugMode", "theme"], (data) => {
  AUTO_DECRYPT = data.autoDecrypt || false;
  DEBUG_MODE = data.debugMode || false;

  if (DEBUG_MODE) {
    attachDebugListeners();
    console.log("[INFO] Debug mode is ON in content script.");
  }

  // Apply theme
  applyTheme(data.theme || 'system');

  // If auto-decrypt is enabled, run the page decryption
  if (AUTO_DECRYPT) {
    if (DEBUG_MODE) console.log("[INFO] Auto-decryption is ON. Scanning page...");
    scanAndDecryptPage();
  } else {
    if (DEBUG_MODE) console.log("[INFO] Auto-decryption is OFF.");
  }
});

// 2) Listen for messages from background/popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (DEBUG_MODE) console.log("[DEBUG] Received message:", message);
  if (message.action === "toggleDecryption") {
    // Manually trigger a page scan
    scanAndDecryptPage();
    sendResponse({ status: "Decryption triggered" });
  }
  else if (message.action === "decryptText") {
    // Decrypt a single text string from outside
    loadCryptoJS().then(() => {
      chrome.storage.local.get(["defaultPassphrase"], (data) => {
        const storedPassphrase = data.defaultPassphrase || "";
        const userPassphrase = storedPassphrase || prompt("Enter decryption passphrase:");
        const decryptedText = decryptText(message.text, userPassphrase);
        sendResponse({ success: !!decryptedText, decryptedText });
      });
    });
    return true; // indicates async response
  }
});

// 3) Attach debug listeners for scroll/touch/wheel if debugMode is on
function attachDebugListeners() {
  document.addEventListener("scroll", () => console.log("[DEBUG] Scrolling..."), { passive: true });
  document.addEventListener("touchstart", () => console.log("[DEBUG] Touch detected..."), { passive: true });
  document.addEventListener("wheel", () => console.log("[DEBUG] Mouse wheel used..."), { passive: true });
}

// 4) Main function to scan the page for ENC[...] and decrypt
async function scanAndDecryptPage() {
  if (DEBUG_MODE) console.log("[INFO] Starting scanAndDecryptPage...");
  await loadCryptoJS();

  // 4a) Get default passphrase if set
  chrome.storage.local.get("defaultPassphrase", (data) => {
    const storedPassphrase = data.defaultPassphrase || "";
    // If there's no stored passphrase, prompt once
    const passphrase = storedPassphrase || prompt("Enter passphrase to decrypt:");
    if (!passphrase) {
      if (DEBUG_MODE) console.log("[WARN] No passphrase provided. Aborting decryption.");
      return;
    }

    // 4b) Use a TreeWalker to find all text nodes with ENC[...]
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
      const textContent = node.nodeValue;
      if (!textContent || !textContent.includes("ENC[")) continue;

      // 4c) Regex to find all ENC[...] occurrences
      const encRegex = /ENC\[(.*?)\]/g;
      let replacedText = textContent;
      let match;
      let foundEncrypted = false;

      while ((match = encRegex.exec(textContent)) !== null) {
        const encryptedChunk = match[1];
        let decrypted;
        try {
          decrypted = decryptText(encryptedChunk, passphrase);
        } catch (error) {
          logDecryptionError(error);
          console.error("Decryption failed:", error);
          continue;
        }
        if (decrypted) {
          foundEncrypted = true;
          replacedText = replacedText.replace(
            `ENC[${encryptedChunk}]`,
            `🔓${decrypted}`
          );
        } else if (DEBUG_MODE) {
          console.info("[INFO] Decryption failed for chunk (expected):", encryptedChunk);
        }
      }

      if (foundEncrypted) {
        node.nodeValue = replacedText;
      }
    }
    if (DEBUG_MODE) console.log("[INFO] Finished scanning/decrypting.");
  });
}

// 5) Dynamically load crypto-js if needed
async function loadCryptoJS() {
  // If CryptoJS is not defined, inject it
  if (typeof CryptoJS === "undefined") {
    if (DEBUG_MODE) console.log("[INFO] Injecting crypto-js.min.js...");
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("lib/crypto-js.min.js");
    document.head.appendChild(script);
    await new Promise(resolve => (script.onload = resolve));
    if (DEBUG_MODE) console.log("[INFO] crypto-js.min.js loaded.");
  }

  // 6) Define encryption/decryption functions once CryptoJS is guaranteed to be loaded
  if (typeof window.encryptText === "undefined") {
    window.encryptText = encryptText;
  }

  if (typeof window.decryptText === "undefined") {
    window.decryptText = decryptText;
  }
}

function logDecryptionError(error) {
  try {
    chrome.storage.local.get("decryptionErrors", (data) => {
      let errors = data.decryptionErrors || [];
      errors.push({
        timestamp: new Date().toISOString(),
        error: error.message || "Unknown error"
      });
      chrome.storage.local.set({ decryptionErrors: errors });
    });
  } catch (e) {
    console.error("Failed to log decryption error:", e);
  }
}

// Apply theme
function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
  } else if (theme === 'light') {
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
  } else {
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDarkScheme) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }
}

// Add dynamic elements and animations
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
      to { opacity: 1; }
    }

    .fade-in {
      animation: fadeIn 0.5s ease-in-out;
    }
  `;
  document.head.appendChild(style);
}

document.addEventListener("DOMContentLoaded", () => {
  addDynamicElements();
  addAnimations();
});