document.addEventListener("DOMContentLoaded", async () => {
  await loadCryptoJS();
  initializePopup();
});

async function loadCryptoJS() {
  return new Promise((resolve) => {
    if (typeof CryptoJS === "undefined") {
      const script = document.createElement("script");
      script.src = chrome.runtime.getURL("lib/crypto-js.min.js");
      script.onload = () => {
        console.log("✅ CryptoJS loaded in popup.");
        resolve();
      };
      document.head.appendChild(script);
    } else {
      resolve();
    }
  });
}

function initializePopup() {
  const encryptBtn = document.getElementById("encryptBtn");
  const decryptBtn = document.getElementById("decryptBtn");
  const copyBtn = document.getElementById("copyBtn");
  const passphraseInput = document.getElementById("passphrase");
  const textInput = document.getElementById("textInput");
  const output = document.getElementById("output");
  const togglePassphraseBtn = document.getElementById("togglePassphrase");
  const settingsBtn = document.getElementById("settingsBtn");

  settingsBtn.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  togglePassphraseBtn.addEventListener("click", () => {
    const type = passphraseInput.getAttribute("type") === "password" ? "text" : "password";
    passphraseInput.setAttribute("type", type);
  });

  encryptBtn.addEventListener("click", () => processText("encrypt"));
  decryptBtn.addEventListener("click", () => processText("decrypt"));

  copyBtn.addEventListener("click", () => {
    if (!output.value.trim()) return;
    navigator.clipboard.writeText(output.value + "\n\n🔐 Securely encrypted with OpenForum")
      .then(() => alert("📋 Copied to clipboard!"))
      .catch(() => alert("❌ Copy failed."));
  });

  function processText(mode) {
    if (!textInput.value.trim() || !passphraseInput.value.trim()) {
      alert("⚠️ Enter text & passphrase.");
      return;
    }

    const text = textInput.value.trim();
    const passphrase = passphraseInput.value.trim();
    output.value = mode === "encrypt" ? encryptText(text, passphrase) : decryptText(text, passphrase);
  }

  function encryptText(text, passphrase) {
    return `ENC[${CryptoJS.AES.encrypt(text, passphrase).toString()}]`;
  }

  function decryptText(text, passphrase) {
    try {
      const encryptedData = text.replace("ENC[", "").replace("]", "").trim();
      const bytes = CryptoJS.AES.decrypt(encryptedData, passphrase);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted || "❌ Decryption failed.";
    } catch (error) {
      console.error("Decryption failed:", error);
      return "❌ Decryption failed.";
    }
  }
}
document.addEventListener("DOMContentLoaded", async () => {
  await loadCryptoJS();
  initializePopup();
});

async function loadCryptoJS() {
  return new Promise((resolve) => {
    if (typeof CryptoJS === "undefined") {
      const script = document.createElement("script");
      script.src = chrome.runtime.getURL("lib/crypto-js.min.js");
      script.onload = () => {
        console.log("✅ CryptoJS loaded in popup.");
        resolve();
      };
      document.head.appendChild(script);
    } else {
      resolve();
    }
  });
}

function initializePopup() {
  const encryptBtn = document.getElementById("encryptBtn");
  const decryptBtn = document.getElementById("decryptBtn");
  const copyBtn = document.getElementById("copyBtn");
  const passphraseInput = document.getElementById("passphrase");
  const textInput = document.getElementById("textInput");
  const output = document.getElementById("output");
  const togglePassphraseBtn = document.getElementById("togglePassphrase");
  const settingsBtn = document.getElementById("settingsBtn");

  settingsBtn.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  togglePassphraseBtn.addEventListener("click", () => {
    const type = passphraseInput.getAttribute("type") === "password" ? "text" : "password";
    passphraseInput.setAttribute("type", type);
  });

  encryptBtn.addEventListener("click", () => processText("encrypt"));
  decryptBtn.addEventListener("click", () => processText("decrypt"));

  copyBtn.addEventListener("click", () => {
    if (!output.value.trim()) return;
    navigator.clipboard.writeText(output.value + "\n\n🔐 Securely encrypted with OpenForum")
      .then(() => alert("📋 Copied to clipboard!"))
      .catch(() => alert("❌ Copy failed."));
  });

  function processText(mode) {
    if (!textInput.value.trim() || !passphraseInput.value.trim()) {
      alert("⚠️ Enter text & passphrase.");
      return;
    }

    const text = textInput.value.trim();
    const passphrase = passphraseInput.value.trim();
    output.value = mode === "encrypt" ? encryptText(text, passphrase) : decryptText(text, passphrase);
  }

  function encryptText(text, passphrase) {
    return `ENC[${CryptoJS.AES.encrypt(text, passphrase).toString()}]`;
  }

  function decryptText(text, passphrase) {
    try {
      const encryptedData = text.replace("ENC[", "").replace("]", "").trim();
      const bytes = CryptoJS.AES.decrypt(encryptedData, passphrase);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted || "❌ Decryption failed.";
    } catch (error) {
      console.error("Decryption failed:", error);
      return "❌ Decryption failed.";
    }
  }
}

function logMessage(message) {
  const logContainer = document.getElementById("logContainer");
  if (!logContainer) return;

  const logEntry = document.createElement("div");
  logEntry.textContent = `📌 ${message}`;
  logEntry.className = "log-entry";
  logContainer.appendChild(logEntry);

  // Keep the log container scrollable
  logContainer.scrollTop = logContainer.scrollHeight;
}

copyBtn.addEventListener("click", () => {
  if (!output.value.trim()) return;
  navigator.clipboard.writeText(output.value + "\n\n🔐 Securely encrypted with OpenForum")
    .then(() => logMessage("📋 Copied to clipboard!"))
    .catch(() => logMessage("❌ Copy failed."));
});
