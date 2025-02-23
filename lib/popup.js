document.addEventListener('DOMContentLoaded', () => {
  // References to input fields and buttons
  const messageInput    = document.getElementById('textInput');
  const passphraseInput = document.getElementById('passphrase');
  const encryptButton   = document.getElementById('encryptBtn');
  const decryptButton   = document.getElementById('decryptBtn');
  const copyButton      = document.getElementById('copyBtn');
  const clearLogButton  = document.getElementById('clearLogBtn');
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const logList         = document.getElementById('logList');

  // The output field (must exist in your popup HTML)
  const outputField     = document.getElementById('output');

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
    if (messageInput)    messageInput.value    = data.message     || '';
    if (passphraseInput) passphraseInput.value = data.passphrase  || '';
    if (logList)         displayErrorLogs(data.decryptionErrors   || []);
    applyTheme(data.theme || 'system');
    if (DEBUG_MODE) console.log("[DEBUG] Debug mode is enabled.");
  });

  // =============== ENCRYPT ===============
  if (encryptButton) {
    encryptButton.addEventListener('click', () => {
      const message    = messageInput.value.trim();
      const passphrase = passphraseInput.value.trim();

      if (!message || !passphrase) {
        showError('Please enter both message and passphrase.');
        return;
      }

      try {
        const encrypted = encryptText(message, passphrase);
        // Put encrypted text into the OUTPUT field, not the original input
        outputField.value = `ENC[${encrypted}]`;
        logActivity('Message encrypted successfully.', 'success');

        if (DEBUG_MODE) {
          console.log("[DEBUG] Encrypted message:", encrypted);
        }
      } catch (error) {
        showError('Encryption failed.');
        if (DEBUG_MODE) {
          console.error("[DEBUG] Encryption error:", error);
        }
      }
    });
  }

  // =============== DECRYPT ===============
  if (decryptButton) {
    decryptButton.addEventListener('click', () => {
      const message    = messageInput.value.trim();
      const passphrase = passphraseInput.value.trim();

      if (!message || !passphrase) {
        showError('Please enter both message and passphrase.');
        return;
      }

      try {
        // If your ciphertext is wrapped in ENC[...], remove that
        const rawCipher = message.replace(/^ENC\[/, '').replace(/\]$/, '');
        const decrypted = decryptText(rawCipher, passphrase);

        if (!decrypted) {
          // Typically means invalid passphrase or invalid ciphertext
          showError('Decryption failed. Incorrect passphrase or invalid ciphertext.');
          logActivity('Decryption failed. Incorrect passphrase or invalid ciphertext.', 'error');
        } else {
          // Put decrypted text into the OUTPUT field
          outputField.value = decrypted;
          logActivity('Message decrypted successfully.', 'success');
        }

        if (DEBUG_MODE) {
          console.log("[DEBUG] Decrypted message:", decrypted);
        }
      } catch (error) {
        showError('Decryption error. Ensure the text is correctly formatted.');
        logActivity('Decryption error. Ensure the text is correctly formatted.', 'error');
        if (DEBUG_MODE) {
          console.error("[DEBUG] Decryption error:", error);
        }
      }
    });
  }

  // =============== COPY BUTTON ===============
  if (copyButton) {
    copyButton.addEventListener('click', () => {
      // Copy from the output field
      outputField.select();
      document.execCommand('copy');
      alert('Copied to clipboard!');
    });
  }

  // =============== CLEAR LOGS ===============
  if (clearLogButton) {
    clearLogButton.addEventListener('click', () => {
      chrome.storage.local.set({ decryptionErrors: [] }, () => {
        displayErrorLogs([]);
        alert('Error logs cleared.');
      });
    });
  }

  // =============== OPEN SETTINGS ===============
  if (openSettingsBtn) {
    openSettingsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
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
