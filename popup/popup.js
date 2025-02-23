document.addEventListener('DOMContentLoaded', () => {
  // --- Utility Functions ---
  function addLog(message) {
    let logList = document.getElementById('logList');
    const logContainer = document.getElementById('logContainer');
    // Create logList if it doesn't exist and logContainer is available
    if (!logList && logContainer) {
      logList = document.createElement('ul');
      logList.id = 'logList';
      logContainer.appendChild(logList);
    }
    if (logList) {
      const li = document.createElement('li');
      li.textContent = message;
      logList.appendChild(li);
    } else {
      console.error("logList element not found and could not be created.");
    }
  }

  function showStatus(message, type) {
    const statusMessage = document.getElementById("statusMessage");
    if (!statusMessage) return;
    statusMessage.textContent = message;
    statusMessage.className = type;
    statusMessage.style.display = "block";
    setTimeout(() => {
      statusMessage.textContent = "";
      statusMessage.className = "";
      statusMessage.style.display = "none";
    }, 3000);
  }

  function saveErrorLog(message) {
    chrome.storage.local.get("decryptionErrors", (data) => {
      const errors = data.decryptionErrors || [];
      errors.push({
        timestamp: new Date().toISOString(),
        error: message
      });
      chrome.storage.local.set({ decryptionErrors: errors });
    });
  }

  function saveLog(message) {
    chrome.storage.local.get("logs", (data) => {
      const logs = data.logs || [];
      logs.push(`${new Date().toISOString()}: ${message}`);
      chrome.storage.local.set({ logs });
      addLog(message);
    });
  }

  // --- UI Element Setup ---
  const passwordField = document.getElementById('password');
  if (passwordField) passwordField.value = '';

  document.getElementById('togglePassword')?.addEventListener('click', () => {
    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);
    const eyeIcon = document.getElementById('togglePasswordIcon');
    eyeIcon?.classList.toggle('fa-eye');
    eyeIcon?.classList.toggle('fa-eye-slash');
  });

  document.getElementById('settingsButton')?.addEventListener('click', () => {
    const popupContent = document.getElementById('popupContent');
    const optionsFrame = document.getElementById('optionsFrame');
    const backButton = document.getElementById('backButton');
    if (optionsFrame.style.display === 'none') {
      optionsFrame.style.display = 'block';
      popupContent.style.display = 'none';
      backButton.style.display = 'inline-block';
    } else {
      optionsFrame.style.display = 'none';
      popupContent.style.display = 'block';
      backButton.style.display = 'none';
    }
  });

  document.getElementById('backButton')?.addEventListener('click', () => {
    const popupContent = document.getElementById('popupContent');
    const optionsFrame = document.getElementById('optionsFrame');
    const backButton = document.getElementById('backButton');
    optionsFrame.style.display = 'none';
    popupContent.style.display = 'block';
    backButton.style.display = 'none';
  });

  document.getElementById('darkModeToggle')?.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });

  document.getElementById('helpButton')?.addEventListener('click', () => {
    const popupContent = document.getElementById('popupContent');
    const helpContent = document.getElementById('helpContent');
    helpContent.style.display = helpContent.style.display === 'none' ? 'block' : 'none';
    popupContent.style.display = helpContent.style.display === 'none' ? 'block' : 'none';
  });

  document.getElementById('feedbackButton')?.addEventListener('click', () => {
    const popupContent = document.getElementById('popupContent');
    const feedbackContent = document.getElementById('feedbackContent');
    feedbackContent.style.display = feedbackContent.style.display === 'none' ? 'block' : 'none';
    popupContent.style.display = feedbackContent.style.display === 'none' ? 'block' : 'none';
  });

  document.getElementById('themeButton')?.addEventListener('click', () => {
    const popupContent = document.getElementById('popupContent');
    const themeContent = document.getElementById('themeContent');
    themeContent.style.display = themeContent.style.display === 'none' ? 'block' : 'none';
    popupContent.style.display = themeContent.style.display === 'none' ? 'block' : 'none';
  });

  document.getElementById('feedbackForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const feedbackText = document.getElementById('feedbackText').value;
    console.log('Feedback submitted:', feedbackText);
    alert('Thank you for your feedback!');
    document.getElementById('feedbackContent').style.display = 'none';
    document.getElementById('popupContent').style.display = 'block';
  });

  document.getElementById('themeSelector')?.addEventListener('change', (event) => {
    const theme = event.target.value;
    document.body.className = theme;
  });

  // --- Encryption/Decryption Logic ---
  const encryptBtn = document.getElementById("encryptBtn");
  const decryptBtn = document.getElementById("decryptBtn");
  const copyBtn = document.getElementById("copyBtn");
  const togglePassphraseBtn = document.getElementById("togglePassphrase");
  const passphraseInput = document.getElementById("passphrase");
  const textInput = document.getElementById("textInput");
  const output = document.getElementById("output");

  function encryptText(text, passphrase) {
    try {
      const encrypted = CryptoJS.AES.encrypt(text, passphrase).toString();
      return `ENC[${encrypted}]\n\n🔐 Securely encrypted with OpenForum`;
    } catch (error) {
      console.error("Encryption failed:", error);
      showStatus("❌ Encryption failed.", "error");
      saveErrorLog("Encryption failed: " + error.message);
      return "";
    }
  }

  function decryptText(text, passphrase) {
    try {
      const encRegex = /ENC\[(.*?)\]/;
      const match = text.match(encRegex);
      if (!match || match.length < 2) {
        console.error("No valid encrypted text found.");
        return "❌ No valid encrypted text found.";
      }
      const encryptedChunk = match[1];
      const bytes = CryptoJS.AES.decrypt(encryptedChunk, passphrase);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted || "❌ Decryption failed. Incorrect passphrase or corrupted data.";
    } catch (error) {
      console.error("Decryption failed:", error);
      showStatus("❌ Decryption failed.", "error");
      saveErrorLog("Decryption failed: " + error.message);
      return "";
    }
  }

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
    chrome.storage.local.get("redditUsername", (data) => {
      if (data.redditUsername) {
        passphrase = data.redditUsername;
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
      if (output.value.startsWith("❌")) {
        showStatus("❌ Decryption failed.", "error");
      } else {
        showStatus("🔓 Decryption successful.", "success");
      }
      saveLog(`Decrypted text: ${text}`);
    }
  }

  encryptBtn?.addEventListener("click", () => processText("encrypt"));
  decryptBtn?.addEventListener("click", () => processText("decrypt"));
  copyBtn?.addEventListener("click", () => {
    if (!output.value.trim()) return;
    navigator.clipboard.writeText(output.value)
      .then(() => { showStatus("📋 Copied to clipboard!", "success"); })
      .catch(() => { showStatus("❌ Failed to copy.", "error"); });
  });
  togglePassphraseBtn?.addEventListener("click", () => {
    passphraseInput.type = passphraseInput.type === "password" ? "text" : "password";
    togglePassphraseBtn.innerText = passphraseInput.type === "password" ? "👁" : "🙈";
  });
  document.getElementById("clearLogBtn")?.addEventListener("click", () => {
    const logListElem = document.getElementById("logList");
    if (logListElem) logListElem.innerHTML = "";
    chrome.storage.local.set({ logs: [] });
    showStatus("🗑 Log cleared.", "success");
  });
  document.getElementById("openOptions")?.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  chrome.storage.local.get(["logs"], (data) => {
    const logs = data.logs || [];
    logs.forEach(log => addLog(log));
  });

  if (typeof CryptoJS === "undefined") {
    console.error("❌ CryptoJS is not loaded!");
    showStatus("⚠️ Encryption library missing!", "error");
    return;
  }

  setTimeout(() => addLog("Initialization complete."), 100);
});
