document.addEventListener("DOMContentLoaded", function () {
  const encryptBtn = document.getElementById("encryptBtn");
  const decryptBtn = document.getElementById("decryptBtn");
  const copyBtn = document.getElementById("copyBtn");
  const togglePassphraseBtn = document.getElementById("togglePassphrase");
  const passphraseInput = document.getElementById("passphrase");
  const textInput = document.getElementById("textInput");
  const output = document.getElementById("output");
  const statusMessage = document.getElementById("statusMessage");
  const clearLogBtn = document.getElementById("clearLogBtn");
  const openOptions = document.getElementById("openOptions");
  const autoDecryptToggle = document.getElementById("autoDecryptToggle");
  const redditUsernameToggle = document.getElementById("redditUsernameToggle");

  // Load settings from storage
  chrome.storage.local.get(["autoDecrypt", "redditUsername"], (data) => {
    autoDecryptToggle.checked = data.autoDecrypt || false;
    redditUsernameToggle.checked = data.redditUsername || false;
  });

  // Save settings to storage
  autoDecryptToggle.addEventListener("change", () => {
    chrome.storage.local.set({ autoDecrypt: autoDecryptToggle.checked });
  });

  redditUsernameToggle.addEventListener("change", () => {
    chrome.storage.local.set({ redditUsername: redditUsernameToggle.checked });
  });

  // ✅ Check if CryptoJS is Loaded
  if (typeof CryptoJS === "undefined") {
    console.error("❌ CryptoJS is not loaded!");
    showStatus("⚠️ Encryption library missing!", "error");
    return;
  }

  // Toggle passphrase visibility
  if (togglePassphraseBtn) {
    togglePassphraseBtn.addEventListener("click", () => {
      passphraseInput.type = passphraseInput.type === "password" ? "text" : "password";
      togglePassphraseBtn.innerText = passphraseInput.type === "password" ? "👁" : "🙈";
    });
  }

  // Handle encrypt/decrypt buttons
  encryptBtn.addEventListener("click", () => processText("encrypt"));
  decryptBtn.addEventListener("click", () => processText("decrypt"));

  // Copy output text
  copyBtn.addEventListener("click", () => {
    if (!output.value.trim()) return;
    navigator.clipboard.writeText(output.value)
      .then(() => {
        showStatus("📋 Copied to clipboard!", "success");
      })
      .catch(() => {
        showStatus("❌ Failed to copy.", "error");
      });
  });

  // Clear log
  clearLogBtn.addEventListener("click", () => {
    document.getElementById("logList").innerHTML = "";
    showStatus("🗑 Log cleared.", "success");
  });

  // Open options page
  openOptions.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  // Main logic for encryption/decryption
  function processText(mode) {
    if (!textInput || !passphraseInput) {
      showStatus("⚠️ Missing input fields!", "error");
      return;
    }

    const text = textInput.value.trim();
    const passphrase = passphraseInput.value.trim();

    if (!text || !passphrase) {
      showStatus("⚠️ Enter text and passphrase.", "error");
      return;
    }

    if (mode === "encrypt") {
      output.value = encryptText(text, passphrase);
      showStatus("🔒 Encrypted text generated.", "success");
      saveLog(`Encrypted text: ${text}`);
    } else {
      output.value = decryptText(text, passphrase);
      showStatus("🔓 Decryption attempted.", "success");
      saveLog(`Decrypted text: ${text}`);
    }
  }

  function encryptText(text, passphrase) {
    try {
      const encrypted = CryptoJS.AES.encrypt(text, passphrase).toString();
      return `ENC[${encrypted}]\n\n🔐 Securely encrypted with OpenForum`;
    } catch (error) {
      console.error("Encryption failed:", error);
      showStatus("❌ Encryption failed.", "error");
      return "";
    }
  }

  function decryptText(text, passphrase) {
    try {
      const encryptedData = text.replace("ENC[", "").replace("]", "").trim();
      const bytes = CryptoJS.AES.decrypt(encryptedData, passphrase);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted || "❌ Decryption failed. Incorrect passphrase or corrupted data.";
    } catch (error) {
      console.error("Decryption failed:", error);
      showStatus("❌ Decryption failed.", "error");
      return "";
    }
  }

  function saveLog(message) {
    chrome.storage.local.get("logs", (data) => {
      const logs = data.logs || [];
      logs.push(`${new Date().toISOString()}: ${message}`);
      chrome.storage.local.set({ logs });
    });
  }

  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = type;
    setTimeout(() => {
      statusMessage.textContent = "";
      statusMessage.className = "";
    }, 3000);
  }
});