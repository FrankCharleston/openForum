/*********************************************************
 * content_script.js
 *
 * - Ensures CryptoJS loads before attempting decryption
 * - Reads "autoDecrypt", "debugMode", & "theme" from storage
 * - If autoDecrypt is disabled, adds a decrypt button next to ENC[] blocks
 * - If autoDecrypt is enabled, decrypts the page on load
 * - Listens for messages (toggleDecryption, decryptText)
 * - Applies theme settings
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

  const hashed = hashPassphrase(passphrase);
  const bytes = CryptoJS.AES.decrypt(encryptedText, hashed);
  try {
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("❌ Decryption failed:", error);
    return "⚠️ Decryption error.";
  }
}

// =============== ENSURE CRYPTOJS IS LOADED FIRST ===============
async function loadCryptoJS() {
  return new Promise((resolve) => {
    if (typeof CryptoJS === "undefined") {
      const script = document.createElement("script");
      script.src = chrome.runtime.getURL("lib/crypto-js.min.js");
      script.onload = () => {
        console.log("✅ CryptoJS loaded successfully.");
        resolve();
      };
      document.head.appendChild(script);
    } else {
      resolve();
    }
  });
}

// =============== INITIALIZE SETTINGS AFTER CRYPTOJS LOADS ===============
async function initSettings() {
  await loadCryptoJS(); // Ensure CryptoJS is available before proceeding

  const data = await getStorage(["autoDecrypt", "debugMode", "theme"]);
  AUTO_DECRYPT = data.autoDecrypt || false;
  DEBUG_MODE = data.debugMode || false;

  if (DEBUG_MODE) {
    console.log("🛠 Debug mode is ON.");
  }

  // Apply theme
  applyTheme(data.theme || "system");

  // Either auto-decrypt or add decrypt buttons
  if (AUTO_DECRYPT) {
    console.log("🔓 AutoDecrypt is enabled. Running after CryptoJS is loaded...");
    scanAndDecryptPage();
  } else {
    console.log("🛠 AutoDecrypt is disabled. Adding decrypt buttons instead.");
    addDecryptButtonsToEncryptedComments();
  }
}

// =============== SCAN & DECRYPT PAGE ===============
async function scanAndDecryptPage() {
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

// =============== ADD DECRYPT BUTTONS NEXT TO ENC[] COMMENTS ===============
function addDecryptButtonsToEncryptedComments() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
  let node;
  while ((node = walker.nextNode())) {
    const textContent = node.nodeValue;
    if (!textContent || !textContent.includes("ENC[")) continue;

    const encRegex = /ENC\[(.*?)\]/g;
    let match;
    while ((match = encRegex.exec(textContent)) !== null) {
      const encryptedChunk = match[1];

      // Create decrypt button
      let decryptBtn = document.createElement("button");
      decryptBtn.innerText = "🔓 Decrypt";
      decryptBtn.style = `
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        padding: 3px 6px;
        margin-left: 5px;
        cursor: pointer;
      `;

      decryptBtn.addEventListener("click", async () => {
        await loadCryptoJS();
        const passphrase = prompt("🔑 Enter passphrase:");
        if (!passphrase) return;
        let decrypted = decryptText(encryptedChunk, passphrase);
        if (decrypted) {
          node.nodeValue = node.nodeValue.replace(`ENC[${encryptedChunk}]`, `🔓${decrypted}`);
          decryptBtn.remove();
        }
      });

      // Add button next to the encrypted text
      let parent = node.parentElement;
      if (parent) {
        parent.appendChild(decryptBtn);
      }
    }
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

// Run everything AFTER CryptoJS loads
loadCryptoJS().then(() => {
  document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Initializing OpenForum content script...");
    addDecryptButton();
    initSettings();
  });
});
