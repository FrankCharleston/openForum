/*********************************************************
 * content_script.js (Unified)
 * 
 * 1. Checks chrome.storage.local for "decryptionEnabled"
 *    to decide if we should auto-decrypt on page load.
 * 2. Logs certain user interactions (scroll, touch, wheel)
 *    if DEBUG_MODE is enabled (optional).
 * 3. Listens for messages from background/popup:
 *    - toggleDecryption: triggers a manual scan/decrypt
 *    - decryptText: decrypts a single text string
 * 4. Dynamically loads crypto-utils.js if not already loaded.
 * 5. Uses a TreeWalker approach to find all ENC[...] blocks
 *    in text nodes and decrypt them.
 *********************************************************/

// === 1) Optional: Debug Mode for logging user interactions ===
const DEBUG_MODE = false;

if (DEBUG_MODE) {
  document.addEventListener("scroll", () => console.log("[INFO] Scrolling detected"), { passive: true });
  document.addEventListener("touchstart", () => console.log("[INFO] Touch detected"), { passive: true });
  document.addEventListener("wheel", () => console.log("[INFO] Mouse wheel used"), { passive: true });
}

// === 2) On DOM load, check if auto-decryption is enabled, then maybe decrypt. ===
document.addEventListener("DOMContentLoaded", async () => {
  if (DEBUG_MODE) console.log("[INFO] Unified content script loaded.");

  await loadCryptoUtils();

  // Check if user enabled auto decryption
  chrome.storage.local.get("decryptionEnabled", (data) => {
    if (data.decryptionEnabled) {
      if (DEBUG_MODE) console.log("[INFO] Auto-decryption enabled. Scanning page...");
      scanAndDecrypt();
    }
  });
});

// === 3) Listen for messages from background/popup scripts ===
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleDecryption") {
    // Manual request to decrypt the entire page
    scanAndDecrypt();
    sendResponse({ status: "Decryption triggered" });
  } 
  else if (message.action === "decryptText") {
    // Decrypt a single string (maybe from a popup button)
    loadCryptoUtils().then(() => {
      const userPassphrase = prompt("Enter decryption passphrase:", "mypassword");
      const decryptedText = decryptText(message.text, userPassphrase);
      sendResponse({ success: !!decryptedText, decryptedText });
    });
    // Return true to indicate we'll respond asynchronously
    return true;
  }
});

console.log("[DEBUG] Content script loaded");

function scanAndDecrypt() {
    console.log("[DEBUG] Scanning page for encrypted messages...");
    document.querySelectorAll("*").forEach(element => {
        const encryptedText = extractEncryptedText(element.innerText);
        if (encryptedText) {
            console.log("[DEBUG] Found encrypted text:", encryptedText);
            let decryptedText = window.decryptText(encryptedText, prompt("Enter passphrase:", "mypassword"));
            if (decryptedText) {
                console.log("[DEBUG] Decrypted text:", decryptedText);
                element.innerHTML = element.innerHTML.replace(
                    `ENC[${encryptedText}]`,
                    `<span class='decrypted-message' style='color: green;'>${decryptedText}</span>`
                );
            } else {
                console.warn("[WARN] Decryption failed for:", encryptedText);
            }
        }
    });
}

function extractEncryptedText(text) {
    const match = text.match(/ENC\[(.*?)\]/);
    return match ? match[1] : null;
}

document.addEventListener("DOMContentLoaded", scanAndDecrypt);


// === 4) Dynamically load crypto-utils.js if needed ===
async function loadCryptoUtils() {
  // If decryptText (or encryptText) is not defined, inject crypto-utils.js
  if (typeof decryptText === "undefined") {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("crypto-utils.js");
    document.head.appendChild(script);
    await new Promise(resolve => (script.onload = resolve));
    if (DEBUG_MODE) console.log("[INFO] crypto-utils.js loaded.");
  }
}

// === 5) scanAndDecrypt: Use a TreeWalker to find ENC[...] in text nodes ===
async function scanAndDecrypt() {
  await loadCryptoUtils();

  // Prompt once for passphrase to avoid multiple prompts
  const passphrase = prompt("Enter passphrase:", "mypassword");
  if (!passphrase) return;

  // Use a TreeWalker to iterate text nodes
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
  let node;
  
  while ((node = walker.nextNode())) {
    const textContent = node.nodeValue;
    if (!textContent || !textContent.includes("ENC[")) continue;

    // Regex to find all ENC[...] occurrences in the text
    const encRegex = /ENC\[(.*?)\]/g;
    let match;
    let replacedText = textContent;
    let foundEncrypted = false;

    while ((match = encRegex.exec(textContent)) !== null) {
      const encryptedChunk = match[1];
      const decrypted = decryptText(encryptedChunk, passphrase);
      if (decrypted) {
        foundEncrypted = true;
        // Replace the exact ENC[...] with a 🔓 symbol + decrypted text
        replacedText = replacedText.replace(`ENC[${encryptedChunk}]`, `🔓${decrypted}`);
      }
    }

    if (foundEncrypted) {
      node.nodeValue = replacedText;
    }
  }
}
