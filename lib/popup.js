document.addEventListener('DOMContentLoaded', () => {
  const messageInput = document.getElementById('textInput');
  const passphraseInput = document.getElementById('passphrase');
  const encryptButton = document.getElementById('encryptBtn');
  const decryptButton = document.getElementById('decryptBtn');
  const copyButton = document.getElementById('copyBtn');
  const clearLogButton = document.getElementById('clearLogBtn');
  const openSettingsButton = document.getElementById('openSettingsBtn');
  const autoDecryptSelect = document.getElementById('autoDecrypt');
  const defaultPassphraseInput = document.getElementById('defaultPassphrase');
  const themeSelect = document.getElementById('theme');
  const saveSettingsButton = document.getElementById('saveSettings');
  const errorLogsDiv = document.getElementById('errorLogs');
  const checkUpdatesButton = document.getElementById('checkUpdatesBtn');
  const logList = document.getElementById('logList');

  let DEBUG_MODE = false;

  // Load settings
  chrome.storage.local.get(['autoDecrypt', 'defaultPassphrase', 'theme', 'debugMode', 'decryptionErrors', 'message', 'passphrase'], (data) => {
    if (autoDecryptSelect) autoDecryptSelect.value = data.autoDecrypt ? 'true' : 'false';
    if (defaultPassphraseInput) defaultPassphraseInput.value = data.defaultPassphrase || '';
    if (themeSelect) themeSelect.value = data.theme || 'system';
    DEBUG_MODE = data.debugMode || false;
    if (messageInput) messageInput.value = data.message || '';
    if (passphraseInput) passphraseInput.value = data.passphrase || '';
    if (errorLogsDiv) displayErrorLogs(data.decryptionErrors || []);
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
      import('./crypto-utils.js').then(({ encryptText }) => {
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
      import('./crypto-utils.js').then(({ decryptText }) => {
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

  // Save settings
  if (saveSettingsButton) {
    saveSettingsButton.addEventListener('click', () => {
      const autoDecrypt = autoDecryptSelect.value === 'true';
      const defaultPassphrase = defaultPassphraseInput.value;
      const theme = themeSelect.value;
      chrome.storage.local.set({ autoDecrypt, defaultPassphrase, theme }, () => {
        alert('Settings saved.');
        applyTheme(theme);
      });
    });
  }

  // Display error logs
  function displayErrorLogs(logs) {
    errorLogsDiv.innerHTML = logs.map(log => `
      <div class="log-entry ${log.error.includes('error') ? 'error' : 'success'}">
        <strong>${log.timestamp}</strong>: ${log.error}
      </div>
    `).join('');
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

  // Check for updates
  if (checkUpdatesButton) {
    checkUpdatesButton.addEventListener('click', () => {
      fetch('https://api.github.com/repos/FrankCharleston/openForum/releases/latest')
        .then(response => response.json())
        .then(data => {
          const latestVersion = data.tag_name;
          alert(`The latest version is ${latestVersion}.`);
          logActivity(`Checked for updates. Latest version: ${latestVersion}`, 'success');
          if (DEBUG_MODE) {
            console.log("[DEBUG] Latest version:", latestVersion);
          }
        })
        .catch(error => {
          alert('Failed to check for updates.');
          logActivity('Failed to check for updates.', 'error');
          if (DEBUG_MODE) {
            console.error("[DEBUG] Update check error:", error);
          }
        });
    });
  }

  // Open settings
  if (openSettingsButton) {
    openSettingsButton.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
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

  // Show error message
  function showError(message) {
    logActivity(message, 'error');
    alert(message);
  }
});
