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

  // Load settingsext, decryptText } = require('./lib/crypto-utils');
  chrome.storage.local.get(['autoDecrypt', 'defaultPassphrase', 'theme', 'debugMode', 'decryptionErrors', 'message', 'passphrase'], (data) => {
    autoDecryptSelect.value = data.autoDecrypt ? 'true' : 'false';
    defaultPassphraseInput.value = data.defaultPassphrase || '';'theme', 'debugMode', 'decryptionErrors'], (data) => {
    themeSelect.value = data.theme || 'system';? 'true' : 'false';
    DEBUG_MODE = data.debugMode || false;efaultPassphrase || '';
    messageInput.value = data.message || '';
    passphraseInput.value = data.passphrase || '';e;
    displayErrorLogs(data.decryptionErrors || []);data.decryptionErrors || []);
    applyTheme(data.theme || 'system');
    if (DEBUG_MODE) {f (DEBUG_MODE) {
      console.log("[DEBUG] Debug mode is enabled."); console.log("[DEBUG] Debug mode is enabled.");
    }    }
  });

  // Encrypt message
  encryptButton.addEventListener('click', () => {=> {
    const message = messageInput.value;alue;
    const passphrase = passphraseInput.value;
    if (!message || !passphrase) {age || !passphrase) {
      alert('Please enter both message and passphrase.'); showError('Please enter both message and passphrase.');
      return;
    }
    const encrypted = CryptoJS.AES.encrypt(message, passphrase).toString();
    messageInput.value = `ENC[${encrypted}]`; = encryptText(message, passphrase);
    logActivity('Message encrypted successfully.', 'success');
    if (DEBUG_MODE) { logActivity('Message encrypted successfully.', 'success');
      console.log("[DEBUG] Encrypted message:", encrypted); if (DEBUG_MODE) {
    }        console.log("[DEBUG] Encrypted message:", encrypted);
  });

  // Decrypt message
  decryptButton.addEventListener('click', () => {
    const message = messageInput.value;ryption error:", error);
    const passphrase = passphraseInput.value;
    if (!message || !passphrase) {
      alert('Please enter both message and passphrase.');
      return;
    }
    try {
      const bytes = CryptoJS.AES.decrypt(message.replace('ENC[', '').replace(']', ''), passphrase);sageInput.value;
    const passphrase = passphraseInput.value;
    if (!message || !passphrase) {
      showError('Please enter both message and passphrase.');'Decryption failed. Incorrect passphrase.');
      return; Incorrect passphrase.', 'error');
    }
    try { messageInput.value = decrypted;
      const decrypted = decryptText(message.replace('ENC[', '').replace(']', ''), passphrase);ssage decrypted successfully.', 'success');
      if (!decrypted) {
        showError('Decryption failed. Incorrect passphrase.');f (DEBUG_MODE) {
        logActivity('Decryption failed. Incorrect passphrase.', 'error');[DEBUG] Decrypted message:", decrypted);
      } else {
        messageInput.value = decrypted;
        logActivity('Message decrypted successfully.', 'success'); error. Ensure the text is correctly formatted.');
      }rrectly formatted.', 'error');
      if (DEBUG_MODE) {f (DEBUG_MODE) {
        console.log("[DEBUG] Decrypted message:", decrypted);   console.error("[DEBUG] Decryption error:", error);
      } }
    } catch (error) {    }
      showError('Decryption error. Ensure the text is correctly formatted.');
      logActivity('Decryption error. Ensure the text is correctly formatted.', 'error');
      if (DEBUG_MODE) {
        console.error("[DEBUG] Decryption error:", error);
      }elect.value === 'true';
    }
  });alue;
ageInput.value;
  // Save settingsst passphrase = passphraseInput.value;
  saveSettingsButton.addEventListener('click', () => {hrome.storage.local.set({ autoDecrypt, defaultPassphrase, theme, message, passphrase }, () => {
    const autoDecrypt = autoDecryptSelect.value === 'true';      alert('Settings saved.');
    const defaultPassphrase = defaultPassphraseInput.value;;
    const theme = themeSelect.value;
    chrome.storage.local.set({ autoDecrypt, defaultPassphrase, theme }, () => {
      alert('Settings saved.');
      applyTheme(theme);
    });isplayErrorLogs(logs) {
  });.innerHTML = logs.map(log => `
   <div class="log-entry ${log.error.includes('error') ? 'error' : 'success'}">
  // Display error logs        <strong>${log.timestamp}</strong>: ${log.error}
  function displayErrorLogs(logs) {
    errorLogsDiv.innerHTML = logs.map(log => `
      <div class="log-entry ${log.error.includes('error') ? 'error' : 'success'}">
        <strong>${log.timestamp}</strong>: ${log.error}
      </div>
    `).join('');LogsButton.addEventListener('click', () => {
  }hrome.storage.local.set({ decryptionErrors: [] }, () => {
      displayErrorLogs([]);
  // Clear logss cleared.');
  clearLogsButton.addEventListener('click', () => {
    chrome.storage.local.set({ decryptionErrors: [] }, () => {
      displayErrorLogs([]);
      alert('Error logs cleared.');s
    });', () => {
  });penForum/releases/latest')

  // Check for updates
  checkUpdatesButton.addEventListener('click', () => {
    fetch('https://api.github.com/repos/FrankCharleston/openForum/releases/latest')lert(`The latest version is ${latestVersion}.`);
      .then(response => response.json())logActivity(`Checked for updates. Latest version: ${latestVersion}`, 'success');
      .then(data => { {
        const latestVersion = data.tag_name;on);
        alert(`The latest version is ${latestVersion}.`);
        logActivity(`Checked for updates. Latest version: ${latestVersion}`, 'success');
        if (DEBUG_MODE) {
          console.log("[DEBUG] Latest version:", latestVersion);
        }lert('Failed to check for updates.');
      })ogActivity('Failed to check for updates.', 'error');
      .catch(error => {   if (DEBUG_MODE) {
        console.error('Error checking for updates:', error);          console.error("[DEBUG] Update check error:", error);
        alert('Failed to check for updates.');
        logActivity('Failed to check for updates.', 'error');
        if (DEBUG_MODE) {
          console.error("[DEBUG] Update check error:", error);
        }
      });pe) {
  });document.createElement('li');

  // Log activityogEntry.textContent = `${new Date().toISOString()}: ${message}`;
  function logActivity(message, type) { logList.appendChild(logEntry);
    const logEntry = document.createElement('li');    if (DEBUG_MODE) {
    logEntry.className = `log-entry ${type}`;g("[DEBUG] Activity log:", message);
    logEntry.textContent = `${new Date().toISOString()}: ${message}`;
    logList.appendChild(logEntry);
    if (DEBUG_MODE) {
      console.log("[DEBUG] Activity log:", message);
    }
  }

  // Apply thement.body.classList.remove('light-mode');
  function applyTheme(theme) {
    if (theme === 'dark') {add('light-mode');
      document.body.classList.add('dark-mode');;
      document.body.classList.remove('light-mode');
    } else if (theme === 'light') {efersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    } else { document.body.classList.remove('light-mode');
      const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches; } else {
      if (prefersDarkScheme) {     document.body.classList.add('light-mode');
        document.body.classList.add('dark-mode');     document.body.classList.remove('dark-mode');
        document.body.classList.remove('light-mode');      }














});  }    logActivity(message, 'error');    alert(message);  function showError(message) {  // Show error message  }    }      }        document.body.classList.remove('dark-mode');        document.body.classList.add('light-mode');      } else {    }
  }
});
