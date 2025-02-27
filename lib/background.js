chrome.runtime.onStartup.addListener(() => {
  console.log("🔄 OpenForum extension started.");
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ OpenForum installed.");
  createContextMenuItems();
  console.log("✅ Context menus created.");
});

function createContextMenuItems() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "encryptText",
      title: "Encrypt Selected Text",
      contexts: ["selection"]
    });

    chrome.contextMenus.create({
      id: "decryptText",
      title: "Decrypt Selected Text",
      contexts: ["selection"]
    });
  });
}

// ✅ Ensure injectAndExecuteScript is defined before it's called
function injectAndExecuteScript(tabId, func, args) {
  chrome.scripting.executeScript({
    target: { tabId },
    files: ["lib/crypto-js.min.js"]
  }).then(() => {
    return chrome.scripting.executeScript({
      target: { tabId },
      func,
      args: [args]
    });
  }).catch((error) => {
    console.error("❌ Error injecting script:", error);
  });
}

// ✅ Now use the function after defining it
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab || !tab.id || tab.id === -1) {
    console.error("❌ No valid tab detected.");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0 || !tabs[0].id) {
        console.error("❌ No active tab found.");
        return;
      }
      const script = info.menuItemId === "encryptText" ? encryptSelectedText : decryptSelectedText;
      injectAndExecuteScript(tabs[0].id, script, info.selectionText);
    });
    return;
  }
  const script = info.menuItemId === "encryptText" ? encryptSelectedText : decryptSelectedText;
  injectAndExecuteScript(tab.id, script, info.selectionText);
});

async function encryptSelectedText(text) {
  if (!text.trim()) return alert("⚠️ No text selected.");
  await loadCryptoJS();
  const passphrase = prompt("🔑 Enter passphrase:");
  if (!passphrase) return;
  const encrypted = CryptoJS.AES.encrypt(text, passphrase).toString();
  const textToCopy = `ENC[${encrypted}]\n\n🔐 Securely encrypted with OpenForum`;
  navigator.clipboard.writeText(textToCopy).then(() => alert("✅ Encrypted text copied!")).catch(() => alert("❌ Copy failed."));
}

async function decryptSelectedText(text) {
  if (!text.startsWith("ENC[")) return alert("⚠️ Invalid encrypted text.");
  await loadCryptoJS();
  const passphrase = prompt("🔑 Enter passphrase:");
  if (!passphrase) return;
  const encryptedData = text.replace("ENC[", "").replace("]", "").trim();
  const decrypted = CryptoJS.AES.decrypt(encryptedData, passphrase).toString(CryptoJS.enc.Utf8);
  alert(decrypted || "❌ Decryption failed.");
}

async function loadCryptoJS() {
  if (typeof CryptoJS === "undefined") {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("lib/crypto-js.min.js");
    document.head.appendChild(script);
    await new Promise((resolve) => (script.onload = resolve));
  }
}
