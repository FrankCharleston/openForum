document.addEventListener("DOMContentLoaded", async () => {
  await loadCryptoJS();
  initializePopup();
  applyTheme();  // Ensure the correct theme is applied on load
});

// 📝 Log messages in popup UI
function logMessage(message, type = "info") {
  const logContainer = document.getElementById("logContainer");
  if (!logContainer) return;

  const logEntry = document.createElement("div");
  logEntry.textContent = `📌 ${message}`;
  logEntry.className = `log-entry ${type}`;
  logContainer.appendChild(logEntry);
  logContainer.scrollTop = logContainer.scrollHeight;
}

// 🛠 Ensure CryptoJS is loaded before usage
async function loadCryptoJS() {
  return new Promise((resolve) => {
    if (typeof CryptoJS === "undefined") {
      const script = document.createElement("script");
      script.src = chrome.runtime.getURL("lib/crypto-js.min.js");
      script.onload = () => {
        logMessage("✅ CryptoJS loaded in popup.", "success");
        resolve();
      };
      document.head.appendChild(script);
    } else {
      resolve();
    }
  });
}

// 🛠 Main Popup Initialization
function initializePopup() {
  const encryptBtn = document.getElementById("encryptBtn");
  const decryptBtn = document.getElementById("decryptBtn");
  const copyBtn = document.getElementById("copyBtn");
  const passphraseInput = document.getElementById("passphrase");
  const textInput = document.getElementById("textInput");
  const output = document.getElementById("output");
  const togglePassphraseBtn = document.getElementById("togglePassphrase");
  const settingsBtn = document.getElementById("settingsBtn");

  if (!encryptBtn || !decryptBtn || !copyBtn || !passphraseInput || !textInput || !output || !togglePassphraseBtn || !settingsBtn) {
    console.error("❌ Missing one or more elements in popup.html.");
    logMessage("❌ Error: UI elements missing. Please check popup.html.", "error");
    return;
  }

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
      .then(() => logMessage("📋 Copied to clipboard!", "success"))
      .catch(() => logMessage("❌ Copy failed.", "error"));
  });

  function processText(mode) {
    if (!textInput.value.trim() || !passphraseInput.value.trim()) {
      logMessage("⚠️ Enter text & passphrase.", "warning");
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
      logMessage("❌ Decryption failed.", "error");
      return "❌ Decryption failed.";
    }
  }
}

// 🎨 Apply Theme Settings
function applyTheme() {
  chrome.storage.local.get("theme", (data) => {
    let theme = data.theme || "system";
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      theme = prefersDark ? "dark" : "light";
    }
    document.body.classList.toggle("dark-mode", theme === "dark");
    document.body.classList.toggle("light-mode", theme === "light");
    logMessage(`🎨 Theme applied: ${theme}`);
  });
}
