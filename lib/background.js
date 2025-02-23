chrome.runtime.onInstalled.addListener(() => {
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

  console.log("Context menus created.");
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab || !tab.id) return;
  const script = info.menuItemId === "encryptText" ? encryptSelectedText : decryptSelectedText;
  injectAndExecuteScript(tab.id, script, info.selectionText);
});

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
    console.error("Error injecting script:", error);
  });
}

async function encryptSelectedText(text) {
  if (!text.trim()) return alert("No text selected.");
  await loadCryptoJS();
  const passphrase = prompt("Enter passphrase:");
  if (!passphrase) return;
  const encrypted = CryptoJS.AES.encrypt(text, passphrase).toString();
  navigator.clipboard.writeText(`ENC[${encrypted}]`).then(() => alert("Encrypted text copied!"));
}

async function decryptSelectedText(text) {
  if (!text.startsWith("ENC[")) return alert("Invalid encrypted text.");
  await loadCryptoJS();
  const passphrase = prompt("Enter passphrase:");
  if (!passphrase) return;
  const encryptedData = text.replace("ENC[", "").replace("]", "").trim();
  const decrypted = CryptoJS.AES.decrypt(encryptedData, passphrase).toString(CryptoJS.enc.Utf8);
  alert(decrypted || "Decryption failed.");
}

async function loadCryptoJS() {
  if (typeof CryptoJS === "undefined") {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("lib/crypto-js.min.js");
    document.head.appendChild(script);
    await new Promise((resolve) => (script.onload = resolve));
  }
}
