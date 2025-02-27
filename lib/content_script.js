document.addEventListener("DOMContentLoaded", async () => {
  await loadCryptoJS();
  initSettings();
});

/**
 * Ensures CryptoJS is loaded before decryption.
 */
async function loadCryptoJS() {
  if (typeof CryptoJS === "undefined") {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = chrome.runtime.getURL("lib/crypto-js.min.js");
      script.onload = () => {
        console.log("✅ CryptoJS loaded.");
        resolve();
      };
      document.head.appendChild(script);
    });
  } else {
    return Promise.resolve();
  }
}

/**
 * Initialize settings and decrypt page if enabled.
 */
async function initSettings() {
  const data = await getStorage(["autoDecrypt"]);
  if (data.autoDecrypt) {
    console.log("🔓 AutoDecrypt enabled.");
    scanAndDecryptPage();
  }
}

/**
 * Decrypts all ENC[...] texts on the page.
 */
async function scanAndDecryptPage() {
  const data = await getStorage(["defaultPassphrase"]);
  const passphrase = data.defaultPassphrase || prompt("🔑 Enter passphrase:");

  if (!passphrase) return;

  document.querySelectorAll("*").forEach((node) => {
    const matches = node.textContent.match(/ENC\[(.*?)\]/g);
    if (matches) {
      matches.forEach((match) => {
        const encryptedText = match.replace("ENC[", "").replace("]", "").trim();
        const decrypted = CryptoJS.AES.decrypt(encryptedText, passphrase).toString(CryptoJS.enc.Utf8);
        node.textContent = node.textContent.replace(match, decrypted);
      });
    }
  });
}
