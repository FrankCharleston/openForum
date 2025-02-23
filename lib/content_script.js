/*********************************************************
 * content_script.js
 *
 * - Reads "autoDecrypt", "debugMode", & "theme" from storage
 * - If autoDecrypt is enabled, decrypts the page on load
 * - Listens for messages (toggleDecryption, decryptText)
 * - Dynamically loads crypto-js if needed
 * - Defines and uses encryptText/decryptText utilities
 * - Replaces ENC[...] blocks with decrypted text
 * - Applies theme settings
 * - Adds an optional “Decrypt Page” button with animations
 *********************************************************/

// Global flags
let DEBUG_MODE = false;
let AUTO_DECRYPT = false;

/**
 * Helper function to get chrome storage as a Promise.
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
  DEBUG_MODE = data.debugMode || false;

  if (DEBUG_MODE) {
    console.log("🛠 Debug mode is ON.");
  }

  // Apply theme
  applyTheme(data.theme || "system");

  // Auto-decrypt page if enabled
  if (AUTO_DECRYPT) {
    scanAndDecryptPage();
  }
})();

// =============== SCAN & DECRYPT PAGE ===============
async function scanAndDecryptPage() {
  await loadCryptoJS();
  const data = await getStorage(["defaultPassphrase"]);
  const storedPassphrase = data.defaultPassphrase || "";
  const passphrase = storedPassphrase || prompt("🔑 Enter passphrase to decrypt:");
  if (!passphrase) return;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
  let node;
  while ((node = walker.nextNode())) {
    const textContent = node.nodeValue;
    if (!textContent || !textContent.includes("ENC[")) continue;

    const encRegex = /ENC\[(.*?)\]/g;
    let replacedText = textContent;
    let match;
    while ((match = encRegex.exec(textContent)) !== null) {
      const encryptedChunk = match[1];
      let decrypted = decryptText(encryptedChunk, passphrase);
      if (decrypted) {
        replacedText = replacedText.replace(`ENC[${encryptedChunk}]`, `🔓${decrypted}`);
      }
    }
    node.nodeValue = replacedText;
  }
}

// =============== THEME HANDLER ===============
function applyTheme(theme) {
  if (!theme || theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    theme = prefersDark ? "dark" : "light";
  }

  document.body.classList.toggle("dark-mode", theme === "dark");
  document.body.classList.toggle("light-mode", theme === "light");
  console.log("🎨 Theme applied:", theme);
}

// =============== OPTIONAL UI ELEMENTS ===============
function addDecryptButton() {
  const decryptButton = document.createElement("button");
  decryptButton.innerText = "🔓 Decrypt Page";
  decryptButton.style = `
    position: fixed; bottom: 10px; right: 10px;
    padding: 10px 20px; background-color: #4CAF50;
    color: white; border: none; border-radius: 5px;
    cursor: pointer; z-index: 1000;
  `;
  decryptButton.addEventListener("click", scanAndDecryptPage);
  document.body.appendChild(decryptButton);
}

// Run once DOM is ready
document.addEventListener("DOMContentLoaded", addDecryptButton);
