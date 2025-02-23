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
      if (DEBUG_MODE) logDebug(`[DEBUG] Decryption failed: Malformed UTF-8 data`);
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
    if (DEBUG_MODE) logDebug("[DEBUG] Settings loaded:", data);
    if (textInput) textInput.value = data.message || '';
    if (data.autoDecrypt) {
      if (passphraseInput) passphraseInput.value = data.defaultPassphrase || '';
    } else {
      if (passphraseInput) passphraseInput.value = '';
    }
    if (logList) displayErrorLogs(data.decryptionErrors || []);
    applyTheme(data.theme || 'system');
    if (DEBUG_MODE) logDebug("[DEBUG] Debug mode is enabled.");
  });

  // ================================
  // 1) ENCRYPTION
  // ================================
  encryptBtn.addEventListener('click', () => {
    const text = textInput.value;
    const passphrase = passphraseInput.value;

    if (!text || !passphrase) {
      if (statusMessage) statusMessage.textContent = 'Please enter both text and passphrase.';
      return;
    }

    try {
      const encrypted = encryptText(text, passphrase);
      if (output) output.value = encrypted;
      if (statusMessage) statusMessage.textContent = 'Text encrypted successfully.';
      addLog('Text encrypted successfully.');
      if (DEBUG_MODE) logDebug("[DEBUG] Text encrypted successfully.");
    } catch (error) {
      if (statusMessage) statusMessage.textContent = 'Encryption failed.';
      addLog('Encryption failed: ' + error.message, true);
      if (DEBUG_MODE) logDebug("[DEBUG] Encryption failed:", error);
    }
  });

  // ================================
  // 2) DECRYPTION
  // ================================
  decryptBtn.addEventListener('click', () => {
    const encryptedText = textInput.value;
    const passphrase = passphraseInput.value;

    if (!encryptedText || !passphrase) {
      if (statusMessage) statusMessage.textContent = 'Please enter both encrypted text and passphrase.';
      return;
    }

    try {
      const originalText = decryptText(encryptedText, passphrase);

      if (!originalText) {
        throw new Error('Invalid passphrase or corrupted data.');
      }

      if (output) output.value = originalText;
      if (statusMessage) statusMessage.textContent = 'Text decrypted successfully.';
      addLog('Text decrypted successfully.');
      if (DEBUG_MODE) logDebug("[DEBUG] Text decrypted successfully.");
    } catch (error) {
      if (statusMessage) statusMessage.textContent = 'Decryption failed.';
      addLog('Decryption failed: ' + error.message, true);
      if (DEBUG_MODE) logDebug("[DEBUG] Decryption failed:", error);
    }
  });

  // ================================
  // 3) COPY TO CLIPBOARD
  // ================================
  copyBtn.addEventListener('click', () => {
    const textToCopy = `🔐 This message is securely encrypted using OpenForum. Join the discussion securely!\n\nENC[${output.value}]`;

    if (!output.value) {
      if (statusMessage) statusMessage.textContent = 'Nothing to copy.';
      return;
    }

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        if (statusMessage) statusMessage.textContent = 'Copied to clipboard.';
        addLog('Copied to clipboard.');
        if (DEBUG_MODE) logDebug("[DEBUG] Copied to clipboard.");
      })
      .catch((error) => {
        if (statusMessage) statusMessage.textContent = 'Copy failed.';
        addLog('Copy failed: ' + error.message, true);
        if (DEBUG_MODE) logDebug("[DEBUG] Copy failed:", error);
      });
  });

  // ================================
  // 4) TOGGLE PASSPHRASE VISIBILITY
  // ================================
  togglePassphraseBtn.addEventListener('click', () => {
    const type = passphraseInput.type === 'password' ? 'text' : 'password';
    passphraseInput.type = type;
    togglePassphraseBtn.textContent = type === 'password' ? '👁' : '🙈';
    if (DEBUG_MODE) logDebug(`[DEBUG] Passphrase visibility toggled to ${type}.`);
  });

  // ================================
  // 5) OPEN SETTINGS
  // ================================
  openSettingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    if (DEBUG_MODE) logDebug("[DEBUG] Opened settings page.");
  });

  // ================================
  // 6) CLEAR LOG
  // ================================
  clearLogBtn.addEventListener('click', () => {
    if (logList) logList.innerHTML = '';
    if (statusMessage) statusMessage.textContent = 'Log cleared.';
    addLog('Log cleared.');
    if (DEBUG_MODE) logDebug("[DEBUG] Log cleared.");
  });

  // ================================
  // 7) ADD LOG ENTRY
  // ================================
  function addLog(message, isError = false) {
    if (!logList) return;
    const logEntry = document.createElement('li');
    logEntry.textContent = message;
    logEntry.className = isError ? 'error' : 'success';
    logList.appendChild(logEntry);
    if (DEBUG_MODE) logDebug(`[DEBUG] Log entry added: ${message}`);
  }

  // =============== LOGGING & ERRORS ===============
  function displayErrorLogs(logs) {
    if (!logList) return;
    logList.innerHTML = logs.map(log => `
      <div class="log-entry ${log.error.includes('error') ? 'error' : 'success'}">
        <strong>${log.timestamp}</strong>: ${log.error}
      </div>
    `).join('');
    if (DEBUG_MODE) logDebug("[DEBUG] Displayed error logs.");
  }

  function logActivity(message, type) {
    if (!logList) return;
    const li = document.createElement('li');
    li.className = `log-entry ${type}`;
    li.textContent = `${new Date().toISOString()}: ${message}`;
    logList.appendChild(li);
    if (DEBUG_MODE) logDebug(`[DEBUG] Activity log: ${message}`);
  }

  function showError(message) {
    logActivity(message, 'error');
    alert(message); // or display in a status field if you prefer
    if (DEBUG_MODE) logDebug(`[DEBUG] Error shown: ${message}`);
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
        if (DEBUG_MODE) logDebug(`[DEBUG] Decryption error logged: ${error.message}`);
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
    if (DEBUG_MODE) logDebug(`[DEBUG] Theme applied: ${theme}`);
  }

  // =============== DEBUG LOGGING ===============
  function logDebug(message, ...optionalParams) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`, ...optionalParams);
  }
});
