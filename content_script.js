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

// 1) Read settings from storage
chrome.storage.local.get(["autoDecrypt", "debugMode"], (data) => {
  AUTO_DECRYPT = data.autoDecrypt || false;
  DEBUG_MODE = data.debugMode || false;

  if (DEBUG_MODE) {
    attachDebugListeners();
    console.log("[INFO] Debug mode is ON in content script.");
  }

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
  if (message.action === "toggleDecryption") {
    // Manually trigger a page scan
    scanAndDecryptPage();
    sendResponse({ status: "Decryption triggered" });
  }
  else if (message.action === "decryptText") {
    // Decrypt a single text string from outside
    loadCryptoJS().then(() => {
      chrome.storage.local.get("defaultPassphrase", (data) => {
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
        const decrypted = decryptText(encryptedChunk, passphrase);
        if (decrypted) {
          foundEncrypted = true;
          replacedText = replacedText.replace(
            `ENC[${encryptedChunk}]`,
            `🔓${decrypted}`
          );
        } else if (DEBUG_MODE) {
          console.warn("[WARN] Decryption failed for chunk:", encryptedChunk);
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
    script.src = chrome.runtime.getURL("crypto-js.min.js");
    document.head.appendChild(script);
    await new Promise(resolve => (script.onload = resolve));
    if (DEBUG_MODE) console.log("[INFO] crypto-js.min.js loaded.");
  }

  // 6) Define encryption/decryption functions once CryptoJS is guaranteed to be loaded
  if (typeof window.encryptText === "undefined") {
    window.encryptText = function (text, passphrase) {
      if (typeof CryptoJS === "undefined") {
        console.error("[ERROR] CryptoJS not loaded!");
        return null;
      }
      return CryptoJS.AES.encrypt(text, passphrase).toString();
    };
  }

  if (typeof window.decryptText === "undefined") {
    window.decryptText = function (encryptedText, passphrase) {
      if (typeof CryptoJS === "undefined") {
        console.error("[ERROR] CryptoJS not loaded!");
        return null;
      }
      try {
        let bytes = CryptoJS.AES.decrypt(encryptedText, passphrase);
        return bytes.toString(CryptoJS.enc.Utf8);
      } catch (error) {
        console.error("Decryption failed:", error);
        return null;
      }
    };
  }
}

// Example from background.js or content_script.js
chrome.storage.local.get("decryptionErrors", (data) => {
  let errors = data.decryptionErrors || [];
  errors.push({
    timestamp: new Date().toISOString(),
    error: error.message || "Unknown error"
  });
  chrome.storage.local.set({ decryptionErrors: errors });
});


/**
 * If you prefer local functions instead of window.*:
 * 
 * function encryptText(text, passphrase) {
 *   // ...
 * }
 * 
 * function decryptText(encryptedText, passphrase) {
 *   // ...
 * }
 * 
 * Then inside scanAndDecryptPage(), just call decryptText(...) 
 * with no need for window.decryptText.
 */

/**
 * Alternatively, if you already define a local decryptText above:
 *   function decryptText(encryptedText, passphrase) { ... }
 * You can remove the "window.decryptText" block here. 
 * Just keep your code consistent in how you call it.
 */