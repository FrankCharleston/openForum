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
  const exportLogsBtn = document.getElementById("exportLogsBtn");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const toggleDarkModeBtn = document.getElementById("toggleDarkMode");

  // Load settings from storage
  chrome.storage.local.get(["logs", "debugMode", "darkMode"], (data) => {
    const logs = data.logs || [];
    const debugMode = data.debugMode || false;
    const darkMode = data.darkMode || false;
    logs.forEach(log => addLog(log));
    if (debugMode) console.log("[DEBUG] Loaded settings from storage:", data);
    if (darkMode) document.body.classList.add("dark-mode");
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

  // Toggle dark mode
  toggleDarkModeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDarkMode = document.body.classList.contains("dark-mode");
    chrome.storage.local.set({ darkMode: isDarkMode });
  });

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
    chrome.storage.local.set({ logs: [] });
    showStatus("🗑 Log cleared.", "success");
  });

  // Open options page
  openOptions.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  // Export logs
  exportLogsBtn.addEventListener("click", () => {
    chrome.storage.local.get("logs", (data) => {
      const logs = data.logs || [];
      const blob = new Blob([logs.join("\n")], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "logs.txt";
      a.click();
      URL.revokeObjectURL(url);
      showStatus("📄 Logs exported.", "success");
    });
  });

  // Main logic for encryption/decryption
  function processText(mode) {
    if (!textInput || !passphraseInput) {
      showStatus("⚠️ Missing input fields!", "error");
      return;
    }

    const text = textInput.value.trim();
    let passphrase = passphraseInput.value.trim();

    if (!text || !passphrase) {
      showStatus("⚠️ Enter text and passphrase.", "error");
      return;
    }

    showLoading(true);

    chrome.storage.local.get(["defaultPassphrase", "debugMode"], (data) => {
      if (data.debugMode) console.log(`[DEBUG] Processing text in mode: ${mode}`);
      if (data.defaultPassphrase) {
        passphrase = data.defaultPassphrase;
      }
      process(mode, text, passphrase);
    });
  }

  function process(mode, text, passphrase) {
    if (mode === "encrypt") {
      output.value = encryptText(text, passphrase);
      showStatus("🔒 Encrypted text generated.", "success");
      saveLog(`Encrypted text: ${text}`);
    } else {
      output.value = decryptText(text, passphrase);
      showStatus("🔓 Decryption attempted.", "success");
      saveLog(`Decrypted text: ${text}`);
    }
    showLoading(false);
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
      addLog(message);
    });
  }

  function addLog(message) {
    const logList = document.getElementById("logList");
    const logItem = document.createElement("li");
    logItem.textContent = message;
    logList.appendChild(logItem);
  }

  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = type;
    setTimeout(() => {
      statusMessage.textContent = "";
      statusMessage.className = "";
    }, 3000);
  }

  function showLoading(isLoading) {
    loadingSpinner.classList.toggle("hidden", !isLoading);
  }
});