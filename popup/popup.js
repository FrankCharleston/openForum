// Listener for when the popup is loaded
document.addEventListener("DOMContentLoaded", async () => {
  await loadCryptoJS();
  initializePopup();
  applySystemTheme();
  logAction("Popup loaded");
  loadHistory();
  makeScrollableIfOverscan();
  loadSettings(); // Ensure settings are loaded
});

/**
 * Logs messages in UI.
 */
function logMessage(message) {
  const logContainer = document.getElementById("logContainer");
  if (!logContainer) return;

  const logEntry = document.createElement("div");
  logEntry.textContent = `📌 ${message}`;
  logEntry.className = "log-entry";
  logContainer.appendChild(logEntry);

  logContainer.scrollTop = logContainer.scrollHeight;
}

/**
 * Applies the system theme.
 */
function applySystemTheme() {
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'cyberpunk-dark' : 'cyberpunk-light';
  document.body.classList.add(systemTheme);
  document.body.classList.add('cyberpunk-theme'); // Ensure theme class is applied
}

/**
 * Loads CryptoJS to prevent decryption failures.
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
 * Initializes the popup.
 */
function initializePopup() {
  const encryptBtn = document.getElementById("encryptBtn");
  const decryptBtn = document.getElementById("decryptBtn");
  const copyBtn = document.getElementById("copyBtn");
  const passphraseInput = document.getElementById("passphrase");
  const textInput = document.getElementById("textInput");
  const output = document.getElementById("output");
  const togglePassphraseBtn = document.getElementById("togglePassphrase");
  const settingsBtn = document.getElementById("settingsBtn");
  const logContainer = document.getElementById("logContainer");

  if (!encryptBtn || !decryptBtn || !copyBtn || !passphraseInput || !textInput || !output || !togglePassphraseBtn || !settingsBtn || !logContainer) {
    console.error("❌ Missing UI elements.");
    return;
  }

  // Event listener for settings button
  settingsBtn.addEventListener("click", () => {
    chrome.runtime.openOptionsPage().catch((error) => {
      console.error("❌ Could not create an options page.", error);
      logMessage("❌ Could not create an options page.");
    });
    logAction("Settings button clicked");
  });

  // Event listener for passphrase visibility toggle
  togglePassphraseBtn.addEventListener("click", () => {
    passphraseInput.type = passphraseInput.type === "password" ? "text" : "password";
    togglePassphraseBtn.textContent = passphraseInput.type === "password" ? "👁️" : "🙈";
    logAction("Toggle passphrase button clicked");
  });

  // Event listener for encrypt button
  encryptBtn.addEventListener("click", () => {
    processText("encrypt");
    logAction("Encrypt button clicked");
  });

  // Event listener for decrypt button
  decryptBtn.addEventListener("click", () => {
    processText("decrypt");
    logAction("Decrypt button clicked");
  });

  // Event listener for copy button
  copyBtn.addEventListener("click", async () => {
    const output = document.getElementById("output");
    if (!output.value.trim()) return;

    const textToCopy = output.value.startsWith("ENC[")
      ? `${output.value}\n\n🔐 Securely encrypted with OpenForum`
      : output.value;

    try {
      await navigator.clipboard.writeText(textToCopy);
      animateCopySuccess();
      logMessage("📋 Copied to clipboard!");
      logAction("Copy button clicked");
    } catch {
      animateCopyFailure();
      logMessage("❌ Copy failed.");
      logAction("Copy button click failed");
    }
  });

  /**
   * Ensures right-click copy appends the encryption message.
   */
  document.addEventListener("copy", (event) => {
    const selection = document.getSelection();
    if (!selection) return;
  
    const textToCopy = `${selection.toString()}\n\n🔐 Securely encrypted with OpenForum`;
    event.clipboardData.setData("text/plain", textToCopy);
    event.preventDefault();
    logAction("Right-click copy");
  });  
  
  /**
   * Animates copy success feedback.
   */
  function animateCopySuccess() {
    const copyBtn = document.getElementById("copyBtn");
    copyBtn.textContent = "✅ Copied!";
    copyBtn.style.backgroundColor = "#00cc99";
  
    setTimeout(() => {
      copyBtn.textContent = "📋 Copy";
      copyBtn.style.backgroundColor = "";
    }, 2000);
  }
  
  /**
   * Animates copy failure feedback.
   */
  function animateCopyFailure() {
    const copyBtn = document.getElementById("copyBtn");
    copyBtn.textContent = "❌ Copy Failed!";
    copyBtn.style.backgroundColor = "#ff3366";
  
    setTimeout(() => {
      copyBtn.textContent = "📋 Copy";
      copyBtn.style.backgroundColor = "";
    }, 2000);
  }
  
  // Function to process text for encryption or decryption
  function processText(mode) {
    if (!textInput.value.trim() || !passphraseInput.value.trim()) {
      console.log("⚠️ Enter text & passphrase.");
      return;
    }
    const text = textInput.value.trim();
    const passphrase = passphraseInput.value.trim();
    const result = mode === "encrypt"
      ? `ENC[${CryptoJS.AES.encrypt(text, passphrase).toString()}]`
      : decryptText(text, passphrase);
    output.value = result;
    updateOptionsOutput(result); // Update options output
    if (mode === "encrypt") {
      saveToHistory(CryptoJS.AES.encrypt(text, passphrase).toString());
    }
  }

  // Function to decrypt text
  function decryptText(text, passphrase) {
    try {
      const encryptedData = text.replace("ENC[", "").replace("]", "").trim();
      const decrypted = CryptoJS.AES.decrypt(encryptedData, passphrase).toString(CryptoJS.enc.Utf8);
      return decrypted || "❌ Decryption failed.";
    } catch {
      console.log("❌ Decryption failed.");
      return "❌ Decryption failed.";
    }
  }
}

/**
 * Logs actions to persistent storage and UI.
 */
function logAction(action) {
  chrome.storage.local.get(["logs", "debug"], (data) => {
    const logs = data.logs || [];
    const logEntry = `${new Date().toISOString()}: ${action}`;
    logs.push(logEntry);
    chrome.storage.local.set({ logs });

    logMessage(action);

    if (data.debug) {
      console.debug(action);
    }
  });
}

// Function to save encrypted text to history
function saveToHistory(encrypted) {
  const history = JSON.parse(localStorage.getItem("encryptedHistory")) || [];
  history.push(encrypted);
  localStorage.setItem("encryptedHistory", JSON.stringify(history));
  loadHistory();
}

// Function to load history of encrypted texts
function loadHistory() {
  const history = JSON.parse(localStorage.getItem("encryptedHistory")) || [];
  const logContainer = document.getElementById("logContainer");
  logContainer.innerHTML = "";
  history.forEach((item, index) => {
    const logEntry = document.createElement("div");
    logEntry.className = "log-entry";
    logEntry.textContent = `Message ${index + 1}: ENC[${item}]`;
    logEntry.addEventListener("click", () => {
      document.getElementById("textInput").value = `ENC[${item}]`;
    });
    logContainer.appendChild(logEntry);
  });
}

// Function to update options output
function updateOptionsOutput(value) {
  chrome.runtime.sendMessage({ action: "updateOptionsOutput", value }, (response) => {
    if (response && response.status === "success") {
      console.log("✅ Options output updated.");
    } else {
      console.error("❌ Failed to update options output.");
    }
  });
}

/**
 * Makes the UI scrollable if it overscans.
 */
function makeScrollableIfOverscan() {
  const body = document.body;
  if (body.scrollHeight > window.innerHeight) {
    body.style.overflowY = "scroll";
  } else {
    body.style.overflowY = "hidden";
  }
}

/**
 * Loads settings and applies them.
 */
function loadSettings() {
  chrome.storage.local.get(["autoDecrypt", "defaultPassphrase", "debug"], (data) => {
    // Apply settings if needed
    if (data.autoDecrypt) {
      // Apply auto-decrypt setting
    }
    if (data.defaultPassphrase) {
      // Apply default passphrase setting
    }
    if (data.debug) {
      // Apply debug setting
    }
  });
}

// Listener for messages from other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateOptionsOutput") {
    document.getElementById("output").value = message.value;
  }
});
