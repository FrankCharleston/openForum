/*********************************************************
 * content_script.js
 * 
 * 1) Logs user interactions if DEBUG_MODE is on (optional).
 * 2) On DOM load, checks chrome.storage.local for "decryptionEnabled"
 *    and decrypts if true.
 * 3) Listens for messages:
 *    - "toggleDecryption" => manually trigger page decryption
 *    - "decryptText" => decrypt a single string
 * 4) Dynamically loads crypto-utils.js if not already present
 * 5) Uses a TreeWalker to find all ENC[...] blocks in text nodes
 *    and replaces them with decrypted text.
 *********************************************************/

// === 1) Optional Debug Logging ===
let DEBUG_MODE = false;

// Load debug setting from storage
chrome.storage.local.get("debugMode", (data) => {
  DEBUG_MODE = data.debugMode || false;

  if (DEBUG_MODE) {
    // Now attach your scroll/touch/wheel listeners
    document.addEventListener("scroll", () => console.log("[INFO] Scrolling detected"), { passive: true });
    document.addEventListener("touchstart", () => console.log("[INFO] Touch detected"), { passive: true });
    document.addEventListener("wheel", () => console.log("[INFO] Mouse wheel used"), { passive: true });
    console.log("[INFO] Debug mode is ON.");
  } else {
    console.log("[INFO] Debug mode is OFF.");
  }

  // The rest of your content script logic
  // ...
});


// === 2) On DOMContentLoaded, check if auto-decryption is enabled ===
document.addEventListener("DOMContentLoaded", async () => {
  if (DEBUG_MODE) console.log("[INFO] Content script loaded.");

  // Make sure decryptText is available
  await loadCryptoUtils();

  chrome.storage.local.get("decryptionEnabled", (data) => {
    if (data.decryptionEnabled) {
      if (DEBUG_MODE) console.log("[INFO] Auto-decryption is ON. Scanning page...");
      scanAndDecrypt();
    }
  });
});

// === 3) Listen for messages from background/popup ===
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleDecryption") {
    // Manual request: decrypt entire page
    scanAndDecrypt();
    sendResponse({ status: "Decryption triggered" });
  } 
  else if (message.action === "decryptText") {
    // Decrypt a single string (e.g. from a popup)
    loadCryptoUtils().then(() => {
      const userPassphrase = prompt("Enter decryption passphrase:", "mypassword");
      const decryptedText = decryptText(message.text, userPassphrase);
      sendResponse({ success: !!decryptedText, decryptedText });
    });
    // Return true to indicate async response
    return true;
  }
});

/**
 * Dynamically load crypto-utils.js if not already loaded
 * so we can use decryptText(...) or encryptText(...).
 */
async function loadCryptoUtils() {
  if (typeof decryptText === "undefined") {
    if (DEBUG_MODE) console.log("[INFO] Injecting crypto-utils.js...");
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("crypto-utils.js");
    document.head.appendChild(script);
    await new Promise(resolve => (script.onload = resolve));
    if (DEBUG_MODE) console.log("[INFO] crypto-utils.js loaded.");
  }
}

/**
 * scanAndDecrypt():
 * - Prompts once for passphrase
 * - Scans the DOM using a TreeWalker for any text containing "ENC[...]"
 * - Replaces each found occurrence with decrypted text (or a 🔓 symbol + decrypted)
 */
async function scanAndDecrypt() {
  if (DEBUG_MODE) console.log("[INFO] Starting scanAndDecrypt...");
  await loadCryptoUtils();

  // Prompt once for passphrase
  const passphrase = prompt("Enter passphrase:", "mypassword");
  if (!passphrase) {
    if (DEBUG_MODE) console.log("[INFO] No passphrase provided. Aborting decryption.");
    return;
  }

  // Use a TreeWalker to iterate text nodes
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
  let node;
  
  while ((node = walker.nextNode())) {
    const textContent = node.nodeValue;
    if (!textContent || !textContent.includes("ENC[")) continue;

    // Find all ENC[...] occurrences
    const encRegex = /ENC\[(.*?)\]/g;
    let replacedText = textContent;
    let match;
    let foundEncrypted = false;

    while ((match = encRegex.exec(textContent)) !== null) {
      const encryptedChunk = match[1];
      const decrypted = decryptText(encryptedChunk, passphrase);
      if (decrypted) {
        foundEncrypted = true;
        // Example: replace with a 🔓 symbol plus the decrypted text
        replacedText = replacedText.replace(
          `ENC[${encryptedChunk}]`,
          `🔓${decrypted}`
        );
      } else {
        if (DEBUG_MODE) console.warn("[WARN] Decryption failed for:", encryptedChunk);
      }
    }

    // If we successfully replaced anything, update the text node
    if (foundEncrypted) {
      node.nodeValue = replacedText;
    }
  }

  if (DEBUG_MODE) console.log("[INFO] Finished scanning/decrypting.");
}
