// Listener for when the extension starts up
chrome.runtime.onStartup.addListener(() => {
  console.log("🔄 OpenForum extension started.");
  createContextMenuItems();
});

// Listener for when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ OpenForum installed.");
  createContextMenuItems();
});

// Listener for messages from other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateOptionsOutput") {
    console.log("Received updateOptionsOutput message:", message.value);
    sendResponse({ status: "success" });
  }
});

/**
 * Creates context menu items.
 */
function createContextMenuItems() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "encryptText",
      title: "🔒 Encrypt Selected Text",
      contexts: ["selection"]
    });

    chrome.contextMenus.create({
      id: "decryptText",
      title: "🔓 Decrypt Selected Text",
      contexts: ["selection"]
    });
  });

  // Listener for context menu item clicks
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (!tab || !tab.id || !tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) {
      console.error("❌ Cannot inject script into a restricted or invalid page.");
      return;
    }

    const script = info.menuItemId === "encryptText" ? encryptSelectedText : decryptSelectedText;
    injectAndExecuteScript(tab.id, script, info.selectionText);
  });
}

/**
 * Injects and executes a script in the specified tab.
 */
function injectAndExecuteScript(tabId, func, args) {
  chrome.tabs.get(tabId, (tab) => {
    if (!tab || !tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) {
      console.error("❌ Cannot inject script into a restricted page:", tab ? tab.url : "unknown");
      return;
    }

    chrome.scripting.executeScript({
      target: { tabId },
      files: ["lib/crypto-js.min.js"]
    }).then(() => {
      return chrome.scripting.executeScript({
        target: { tabId },
        func: func,
        args: [args]
      });
    }).catch((error) => {
      console.error("❌ Error injecting script:", error);
    });
  });
}

/**
 * Encrypts selected text.
 */
async function encryptSelectedText(text) {
  if (!text.trim()) {
    alert("⚠️ No text selected.");
    return;
  }
  
  await loadCryptoJS();
  const passphrase = prompt("🔑 Enter passphrase:");
  if (!passphrase) return;

  try {
    const encrypted = CryptoJS.AES.encrypt(text, passphrase).toString();
    const textToCopy = `ENC[${encrypted}]\n\n🔐 Securely encrypted with OpenForum`;
    
    await navigator.clipboard.writeText(textToCopy);
    alert("✅ Encrypted text copied!");
  } catch (error) {
    console.error("❌ Encryption failed:", error);
    alert("❌ Encryption failed.");
  }
}

/**
 * Decrypts selected text.
 */
async function decryptSelectedText(text) {
  if (!text.startsWith("ENC[")) {
    alert("⚠️ Invalid encrypted text.");
    return;
  }

  await loadCryptoJS();
  const passphrase = prompt("🔑 Enter passphrase:");
  if (!passphrase) return;

  try {
    const encryptedData = text.replace("ENC[", "").replace("]", "").trim();
    const decrypted = CryptoJS.AES.decrypt(encryptedData, passphrase).toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
      throw new Error("Decryption returned an empty result.");
    }

    alert(`🔓 Decrypted text:\n\n${decrypted}`);
  } catch (error) {
    console.error("❌ Decryption failed:", error);
    alert("❌ Decryption failed.");
  }
}

/**
 * Loads CryptoJS if it's not already loaded.
 */
async function loadCryptoJS() {
  return new Promise((resolve) => {
    if (typeof CryptoJS === "undefined") {
      const script = document.createElement("script");
      script.src = chrome.runtime.getURL("lib/crypto-js.min.js");
      script.onload = resolve;
      document.head.appendChild(script);
    } else {
      resolve();
    }
  });
}

/**
 * Applies auto-decrypt feature (if enabled in options).
 */
chrome.storage.local.get("autoDecrypt", (data) => {
  if (data.autoDecrypt) {
    console.log("⚡ Auto-decrypt is enabled.");
    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === "decryptText") {
        decryptSelectedText(info.selectionText);
      }
    });
  }
});
