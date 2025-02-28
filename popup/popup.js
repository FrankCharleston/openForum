document.addEventListener("DOMContentLoaded", async () => {
  await loadCryptoJS();
  initializePopup();
  applySystemTheme();
  logMessage("Popup loaded");
  loadHistory();
  makeScrollableIfOverscan();
  loadSettings();
});

function logMessage(message) {
  const logContainer = document.getElementById("logContainer");
  if (!logContainer) return;

  const logEntry = document.createElement("div");
  logEntry.textContent = `📌 ${message}`;
  logEntry.className = "log-entry";
  logContainer.appendChild(logEntry);

  logContainer.scrollTop = logContainer.scrollHeight;
}

function applySystemTheme() {
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'cyberpunk-dark' : 'cyberpunk-light';
  document.body.classList.add(systemTheme);
  document.body.classList.add('cyberpunk-theme');
}

async function loadCryptoJS() {
  return new Promise((resolve) => {
    if (typeof CryptoJS === "undefined") {
      const script = document.createElement("script");
      script.src = chrome.runtime.getURL("lib/crypto-js.min.js");
      script.onload = () => resolve();
      document.head.appendChild(script);
    } else {
      resolve();
    }
  });
}

function initializePopup() {
  document.getElementById("settingsBtn").addEventListener("click", () => {
    chrome.runtime.openOptionsPage().catch((error) => {
      console.error("❌ Could not open options page.", error);
      logMessage("❌ Could not open options page.");
    });
  });

  document.getElementById("togglePassphrase").addEventListener("click", () => {
    const passphraseInput = document.getElementById("passphrase");
    passphraseInput.type = passphraseInput.type === "password" ? "text" : "password";
  });

  document.getElementById("encryptBtn").addEventListener("click", () => processText("encrypt"));
  document.getElementById("decryptBtn").addEventListener("click", () => processText("decrypt"));
  document.getElementById("copyBtn").addEventListener("click", copyToClipboard);
}

async function processText(mode) {
  const textInput = document.getElementById("textInput").value.trim();
  const passphrase = document.getElementById("passphrase").value.trim();
  const output = document.getElementById("output");

  if (!textInput || !passphrase) return alert("⚠️ Enter text and passphrase.");

  await loadCryptoJS();

  try {
    if (mode === "encrypt") {
      const encrypted = CryptoJS.AES.encrypt(textInput, passphrase).toString();
      output.value = `ENC[${encrypted}]`;
    } else {
      if (!textInput.startsWith("ENC[")) return alert("⚠️ Invalid encrypted text.");
      const encryptedData = textInput.replace("ENC[", "").replace("]", "").trim();
      const decrypted = CryptoJS.AES.decrypt(encryptedData, passphrase).toString(CryptoJS.enc.Utf8);
      output.value = decrypted || "❌ Decryption failed.";
    }
  } catch {
    output.value = "❌ Operation failed.";
  }
}

function copyToClipboard() {
  const output = document.getElementById("output");
  if (!output.value.trim()) return;

  navigator.clipboard.writeText(output.value)
    .then(() => logMessage("📋 Copied to clipboard!"))
    .catch(() => logMessage("❌ Copy failed."));
}
