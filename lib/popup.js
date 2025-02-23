document.addEventListener('DOMContentLoaded', () => {
  // === DOM references ===
  const textInput = document.getElementById('textInput');
  const passphraseInput = document.getElementById('passphrase');
  const output = document.getElementById('output');
  const statusMessage = document.getElementById('statusMessage');
  const logList = document.getElementById('logList');
  const loadingSpinner = document.getElementById('loadingSpinner');

  const encryptBtn = document.getElementById('encryptBtn');
  const decryptBtn = document.getElementById('decryptBtn');
  const copyBtn = document.getElementById('copyBtn');
  const togglePassphraseBtn = document.getElementById('togglePassphrase');
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const clearLogBtn = document.getElementById('clearLogBtn');

  let DEBUG_MODE = false;

  // =============== CRYPTO UTILS ===============
  function hashPassphrase(passphrase) {
    return CryptoJS.SHA256(passphrase).toString();
  }

  function encryptText(text, passphrase) {
    const hashed = hashPassphrase(passphrase);
    return CryptoJS.AES.encrypt(text, hashed).toString();
  }

  function decryptText(encryptedText, passphrase) {
    const hashed = hashPassphrase(passphrase);
    const bytes  = CryptoJS.AES.decrypt(encryptedText, hashed);
    try {
      // Convert to UTF-8 string
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      // Usually means bad passphrase or malformed data
      if (DEBUG_MODE) console.error("[DEBUG] Decryption failed: Malformed UTF-8 data");
      logDecryptionError(new Error("Malformed UTF-8 data"));
      return null;
    }
  }

  // =============== LOAD SETTINGS ===============
  chrome.storage.local.get([
    'autoDecrypt',
    'defaultPassphrase',
    'theme',
    'debugMode',
    'decryptionErrors',
    'message',
    'passphrase'
  ], (data) => {
    DEBUG_MODE = data.debugMode || false;
    if (textInput)    textInput.value    = data.message     || '';
    if (passphraseInput) passphraseInput.value = data.passphrase  || '';
    if (logList)         displayErrorLogs(data.decryptionErrors   || []);
    applyTheme(data.theme || 'system');
    if (DEBUG_MODE) console.log("[DEBUG] Debug mode is enabled.");
  });

  // ================================
  // 1) ENCRYPTION
  // ================================
  encryptBtn.addEventListener('click', () => {
    const text = textInput.value;
    const passphrase = passphraseInput.value;

    if (!text || !passphrase) {
      statusMessage.textContent = 'Please enter both text and passphrase.';
      return;
    }

    try {
      const encrypted = CryptoJS.AES.encrypt(text, passphrase).toString();
      output.value = encrypted;
      statusMessage.textContent = 'Text encrypted successfully.';
      addLog('Text encrypted successfully.');
    } catch (error) {
      statusMessage.textContent = 'Encryption failed.';
      addLog('Encryption failed: ' + error.message, true);
    }
  });

  // ================================
  // 2) DECRYPTION
  // ================================
  decryptBtn.addEventListener('click', () => {
    const encryptedText = textInput.value;
    const passphrase = passphraseInput.value;

    if (!encryptedText || !passphrase) {
      statusMessage.textContent = 'Please enter both encrypted text and passphrase.';
      return;
    }

    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedText, passphrase);
      const originalText = decrypted.toString(CryptoJS.enc.Utf8);

      if (!originalText) {
        throw new Error('Invalid passphrase or corrupted data.');
      }

      output.value = originalText;
      statusMessage.textContent = 'Text decrypted successfully.';
      addLog('Text decrypted successfully.');
    } catch (error) {
      statusMessage.textContent = 'Decryption failed.';
      addLog('Decryption failed: ' + error.message, true);
    }
  });

  // ================================
  // 3) COPY TO CLIPBOARD
  // ================================
  copyBtn.addEventListener('click', () => {
    const textToCopy = output.value;

    if (!textToCopy) {
      statusMessage.textContent = 'Nothing to copy.';
      return;
    }

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        statusMessage.textContent = 'Copied to clipboard.';
        addLog('Copied to clipboard.');
      })
      .catch((error) => {
        statusMessage.textContent = 'Copy failed.';
        addLog('Copy failed: ' + error.message, true);
      });
  });

  // ================================
  // 4) TOGGLE PASSPHRASE VISIBILITY
  // ================================
  togglePassphraseBtn.addEventListener('click', () => {
    const type = passphraseInput.type === 'password' ? 'text' : 'password';
    passphraseInput.type = type;
    togglePassphraseBtn.textContent = type === 'password' ? '👁' : '🙈';
  });

  // ================================
  // 5) OPEN SETTINGS
  // ================================
  openSettingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // ================================
  // 6) CLEAR LOG
  // ================================
  clearLogBtn.addEventListener('click', () => {
    logList.innerHTML = '';
    statusMessage.textContent = 'Log cleared.';
    addLog('Log cleared.');
  });

  // ================================
  // 7) ADD LOG ENTRY
  // ================================
  function addLog(message, isError = false) {
    const logEntry = document.createElement('li');
    logEntry.textContent = message;
    logEntry.className = isError ? 'error' : 'success';
    logList.appendChild(logEntry);
  }

  // =============== LOGGING & ERRORS ===============
  function displayErrorLogs(logs) {
    logList.innerHTML = logs.map(log => `
      <div class="log-entry ${log.error.includes('error') ? 'error' : 'success'}">
        <strong>${log.timestamp}</strong>: ${log.error}
      </div>
    `).join('');
  }

  function logActivity(message, type) {
    const li = document.createElement('li');
    li.className = `log-entry ${type}`;
    li.textContent = `${new Date().toISOString()}: ${message}`;
    logList.appendChild(li);
    if (DEBUG_MODE) console.log("[DEBUG] Activity log:", message);
  }

  function showError(message) {
    logActivity(message, 'error');
    alert(message); // or display in a status field if you prefer
  }

  function logDecryptionError(error) {
    try {
      chrome.storage.local.get("decryptionErrors", (data) => {
        let errors = data.decryptionErrors || [];
        errors.push({
          timestamp: new Date().toISOString(),
          error: error.message || "Unknown error"
        });
        chrome.storage.local.set({ decryptionErrors: errors });
      });
    } catch (e) {
      console.error("[DEBUG] Failed to log decryption error:", e);
    }
  }

  // =============== THEME HANDLER ===============
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else if (theme === 'light') {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    } else {
      const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDarkScheme) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
      } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
      }
    }
  }
});
