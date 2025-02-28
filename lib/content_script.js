// Ensure the content script only runs on allowed pages
if (!window.location.protocol.startsWith("http")) {
  console.warn("⏩ OpenForum: Content script blocked on non-web pages.");
} else {
  document.addEventListener("DOMContentLoaded", async () => {
    await loadCryptoJS();
    initSettings();
  });
}

/**
 * Ensures CryptoJS is loaded before decryption.
 */
async function loadCryptoJS() {
  return new Promise((resolve) => {
    if (typeof CryptoJS === "undefined") {
      const script = document.createElement("script");
      script.src = chrome.runtime.getURL("lib/crypto-js.min.js");
      script.onload = () => {
        console.log("✅ CryptoJS loaded.");
        resolve();
      };
      document.head.appendChild(script);
    } else {
      resolve();
    }
  });
}

/**
 * Initializes settings and decrypts page if auto-decrypt is enabled.
 */
async function initSettings() {
  const { autoDecrypt, defaultPassphrase } = await getStorage(["autoDecrypt", "defaultPassphrase"]);

  if (autoDecrypt) {
    console.log("🔓 AutoDecrypt enabled.");
    scanAndDecryptPage(defaultPassphrase);
  }
}

/**
 * Scans the page and decrypts any detected encrypted text.
 */
async function scanAndDecryptPage(defaultPassphrase) {
  const passphrase = defaultPassphrase || prompt("🔑 Enter passphrase to auto-decrypt:");

  if (!passphrase) {
    console.warn("⏩ OpenForum: Decryption aborted (no passphrase provided).");
    return;
  }

  // Select only text-containing elements (avoid scanning scripts/styles)
  const textNodes = getTextNodes(document.body);

  textNodes.forEach((node) => {
    let text = node.textContent;
    const matches = text.match(/ENC\[(.*?)\]/g);

    if (matches) {
      matches.forEach((match) => {
        try {
          const encryptedText = match.replace("ENC[", "").replace("]", "").trim();
          const decrypted = CryptoJS.AES.decrypt(encryptedText, passphrase).toString(CryptoJS.enc.Utf8);

          if (decrypted) {
            text = text.replace(match, decrypted);
          }
        } catch (error) {
          console.error("❌ OpenForum: Decryption error:", error);
        }
      });

      node.textContent = text;
    }
  });

  console.log("🔓 OpenForum: Auto-decryption complete.");
}

/**
 * Retrieves stored data from Chrome storage.
 */
function getStorage(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, resolve);
  });
}

/**
 * Returns an array of text nodes within the given element.
 */
function getTextNodes(element) {
  const textNodes = [];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);

  while (walker.nextNode()) {
    const currentNode = walker.currentNode;

    if (currentNode.parentNode && isValidTextContainer(currentNode.parentNode)) {
      textNodes.push(currentNode);
    }
  }
  
  return textNodes;
}

/**
 * Determines if an element is a valid container for text decryption.
 */
function isValidTextContainer(element) {
  const invalidTags = ["SCRIPT", "STYLE", "NOSCRIPT", "IFRAME", "TEXTAREA", "INPUT"];
  return !invalidTags.includes(element.tagName);
}
