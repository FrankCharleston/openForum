document.addEventListener('DOMContentLoaded', () => {
  const messageInput = document.getElementById('textInput');
  const passphraseInput = document.getElementById('passphrase');
  const encryptButton = document.getElementById('encryptBtn');
  const decryptButton = document.getElementById('decryptBtn');
  const copyButton = document.getElementById('copyBtn');
  const clearLogButton = document.getElementById('clearLogBtn');
  const openSettingsButton = document.getElementById('openSettingsBtn');
  const logList = document.getElementById('logList');

  let DEBUG_MODE = false;

  // Crypto utility functions
  function hashPassphrase(passphrase) {
    return CryptoJS.SHA256(passphrase).toString();
  }

  function encryptText(text, passphrase) {
    const hashedPassphrase = hashPassphrase(passphrase);
    return CryptoJS.AES.encrypt(text, hashedPassphrase).toString();
  }

  function decryptText(encryptedText, passphrase) {
    const hashedPassphrase = hashPassphrase(passphrase);
    const bytes = CryptoJS.AES.decrypt(encryptedText, hashedPassphrase);
    try {
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      if (DEBUG_MODE) console.error("Decryption failed: Malformed UTF-8 data");
      logDecryptionError(new Error("Malformed UTF-8 data"));
      return null;
    }
  }

  // Load settings
  chrome.storage.local.get(['autoDecrypt', 'defaultPassphrase', 'theme', 'debugMode', 'decryptionErrors', 'message', 'passphrase'], (data) => {
    DEBUG_MODE = data.debugMode || false;
    if (messageInput) messageInput.value = data.message || '';
    if (passphraseInput) passphraseInput.value = data.passphrase || '';
    if (logList) displayErrorLogs(data.decryptionErrors || []);
    applyTheme(data.theme || 'system');
    if (DEBUG_MODE) {
      console.log("[DEBUG] Debug mode is enabled.");
    }
  });

  // Encrypt message
  if (encryptButton) {
    encryptButton.addEventListener('click', () => {
      const message = messageInput.value;
      const passphrase = passphraseInput.value;
      if (!message || !passphrase) {
        showError('Please enter both message and passphrase.');
        return;
      }
      try {
        const encrypted = encryptText(message, passphrase);
        messageInput.value = `ENC[${encrypted}]`;
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

  // Decrypt message
  if (decryptButton) {
    decryptButton.addEventListener('click', () => {
      const message = messageInput.value;
      const passphrase = passphraseInput.value;
      if (!message || !passphrase) {
        showError('Please enter both message and passphrase.');
        return;
      }
      try {
        const decrypted = decryptText(message.replace('ENC[', '').replace(']', ''), passphrase);
        if (!decrypted) {
          showError('Decryption failed. Incorrect passphrase.');
          logActivity('Decryption failed. Incorrect passphrase.', 'error');
        } else {
          messageInput.value = decrypted;
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

  // Copy to clipboard
  if (copyButton) {
    copyButton.addEventListener('click', () => {
      const output = document.getElementById('output');
      output.select();
      document.execCommand('copy');
      alert('Copied to clipboard');
    });
  }

  // Clear logs
  if (clearLogButton) {
    clearLogButton.addEventListener('click', () => {
      chrome.storage.local.set({ decryptionErrors: [] }, () => {
        displayErrorLogs([]);
        alert('Error logs cleared.');
      });
    });
  }

  // Open settings
  if (openSettingsButton) {
    openSettingsButton.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }

  // Display error logs
  function displayErrorLogs(logs) {
    logList.innerHTML = logs.map(log => `
      <div class="log-entry ${log.error.includes('error') ? 'error' : 'success'}">
        <strong>${log.timestamp}</strong>: ${log.error}
      </div>
    `).join('');
  }

  // Log activity
  function logActivity(message, type) {
    const logEntry = document.createElement('li');
    logEntry.className = `log-entry ${type}`;
    logEntry.textContent = `${new Date().toISOString()}: ${message}`;
    logList.appendChild(logEntry);
    if (DEBUG_MODE) {
      console.log("[DEBUG] Activity log:", message);
    }
  }

  // Show error message
  function showError(message) {
    logActivity(message, 'error');
    alert(message);
  }

  // Apply theme
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
      console.error("Failed to log decryption error:", e);
    }
  }
});
