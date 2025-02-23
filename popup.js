document.addEventListener('DOMContentLoaded', () => {
  const messageInput = document.getElementById('message');
  const passphraseInput = document.getElementById('passphrase');
  const encryptButton = document.getElementById('encryptButton');
  const decryptButton = document.getElementById('decryptButton');
  const autoDecryptSelect = document.getElementById('autoDecrypt');
  const defaultPassphraseInput = document.getElementById('defaultPassphrase');
  const themeSelect = document.getElementById('theme');
  const saveSettingsButton = document.getElementById('saveSettings');
  const errorLogsDiv = document.getElementById('errorLogs');
  const clearLogsButton = document.getElementById('clearLogs');
  const checkUpdatesButton = document.getElementById('checkUpdatesBtn');
  const logList = document.getElementById('logList');

  let DEBUG_MODE = false;

  // Load settings
  chrome.storage.local.get(['autoDecrypt', 'defaultPassphrase', 'theme', 'debugMode', 'decryptionErrors'], (data) => {
    autoDecryptSelect.value = data.autoDecrypt ? 'true' : 'false';
    defaultPassphraseInput.value = data.defaultPassphrase || '';
    themeSelect.value = data.theme || 'system';
    DEBUG_MODE = data.debugMode || false;
    displayErrorLogs(data.decryptionErrors || []);
    applyTheme(data.theme || 'system');
    if (DEBUG_MODE) {
      console.log("[DEBUG] Debug mode is enabled.");
    }
  });

  // Encrypt message
  encryptButton.addEventListener('click', () => {
    const message = messageInput.value;
    const passphrase = passphraseInput.value;
    if (!message || !passphrase) {
      alert('Please enter both message and passphrase.');
      return;
    }
    const encrypted = CryptoJS.AES.encrypt(message, passphrase).toString();
    messageInput.value = `ENC[${encrypted}]`;
    logActivity('Message encrypted successfully.', 'success');
    if (DEBUG_MODE) {
      console.log("[DEBUG] Encrypted message:", encrypted);
    }
  });

  // Decrypt message
  decryptButton.addEventListener('click', () => {
    const message = messageInput.value;
    const passphrase = passphraseInput.value;
    if (!message || !passphrase) {
      alert('Please enter both message and passphrase.');
      return;
    }
    try {
      const bytes = CryptoJS.AES.decrypt(message.replace('ENC[', '').replace(']', ''), passphrase);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted) {
        alert('Decryption failed. Incorrect passphrase.');
        logActivity('Decryption failed. Incorrect passphrase.', 'error');
      } else {
        messageInput.value = decrypted;
        logActivity('Message decrypted successfully.', 'success');
      }
      if (DEBUG_MODE) {
        console.log("[DEBUG] Decrypted message:", decrypted);
      }
    } catch (error) {
      alert('Decryption error. Ensure the text is correctly formatted.');
      logActivity('Decryption error. Ensure the text is correctly formatted.', 'error');
      if (DEBUG_MODE) {
        console.error("[DEBUG] Decryption error:", error);
      }
    }
  });

  // Save settings
  saveSettingsButton.addEventListener('click', () => {
    const autoDecrypt = autoDecryptSelect.value === 'true';
    const defaultPassphrase = defaultPassphraseInput.value;
    const theme = themeSelect.value;
    chrome.storage.local.set({ autoDecrypt, defaultPassphrase, theme }, () => {
      alert('Settings saved.');
      applyTheme(theme);
    });
  });

  // Display error logs
  function displayErrorLogs(logs) {
    errorLogsDiv.innerHTML = logs.map(log => `
      <div class="log-entry ${log.error.includes('error') ? 'error' : 'success'}">
        <strong>${log.timestamp}</strong>: ${log.error}
      </div>
    `).join('');
  }

  // Clear logs
  clearLogsButton.addEventListener('click', () => {
    chrome.storage.local.set({ decryptionErrors: [] }, () => {
      displayErrorLogs([]);
      alert('Error logs cleared.');
    });
  });

  // Check for updates
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
        console.error('Error checking for updates:', error);
        alert('Failed to check for updates.');
        logActivity('Failed to check for updates.', 'error');
        if (DEBUG_MODE) {
          console.error("[DEBUG] Update check error:", error);
        }
      });
  });

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
});
