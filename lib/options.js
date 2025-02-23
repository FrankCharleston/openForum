document.addEventListener('DOMContentLoaded', () => {
  const autoDecryptSelect = document.getElementById('autoDecrypt');
  const defaultPassphraseInput = document.getElementById('defaultPassphrase');
  const themeSelect = document.getElementById('theme');
  const debugModeSelect = document.getElementById('debugMode');
  const saveSettingsButton = document.getElementById('saveSettings');
  const errorLogsDiv = document.getElementById('errorLogs');
  const clearErrorLogsButton = document.getElementById('clearErrorLogs');
  const clearActivityLogButton = document.getElementById('clearActivityLog');
  const clearDebugLogButton = document.getElementById('clearDebugLog');
  const exportLogsButton = document.getElementById('exportLogsBtn');
  const checkUpdatesButton = document.getElementById('checkUpdatesBtn');

  // Load settings
  chrome.storage.local.get(['autoDecrypt', 'defaultPassphrase', 'theme', 'debugMode', 'decryptionErrors'], (data) => {
    autoDecryptSelect.value = data.autoDecrypt ? 'true' : 'false';
    defaultPassphraseInput.value = data.defaultPassphrase || '';
    themeSelect.value = data.theme || 'system';
    debugModeSelect.value = data.debugMode ? 'true' : 'false';
    displayErrorLogs(data.decryptionErrors || []);
    applyTheme(data.theme || 'system');
  });

  // Save settings
  saveSettingsButton.addEventListener('click', () => {
    const autoDecrypt = autoDecryptSelect.value === 'true';
    const defaultPassphrase = defaultPassphraseInput.value;
    const theme = themeSelect.value;
    const debugMode = debugModeSelect.value === 'true';
    chrome.storage.local.set({ autoDecrypt, defaultPassphrase, theme, debugMode }, () => {
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

  // Clear error logs
  clearErrorLogsButton.addEventListener('click', () => {
    chrome.storage.local.set({ decryptionErrors: [] }, () => {
      displayErrorLogs([]);
      alert('Error logs cleared.');
    });
  });

  // Clear activity log
  clearActivityLogButton.addEventListener('click', () => {
    // Implement clearing activity log
    alert('Activity log cleared.');
  });

  // Clear debug log
  clearDebugLogButton.addEventListener('click', () => {
    // Implement clearing debug log
    alert('Debug log cleared.');
  });

  // Export logs
  exportLogsButton.addEventListener('click', () => {
    // Implement exporting logs
    alert('Logs exported.');
  });

  // Check for updates
  checkUpdatesButton.addEventListener('click', () => {
    fetch('https://api.github.com/repos/FrankCharleston/openForum/releases/latest')
      .then(response => response.json())
      .then(data => {
        const latestVersion = data.tag_name;
        alert(`The latest version is ${latestVersion}.`);
      })
      .catch(error => {
        alert('Failed to check for updates.');
      });
  });

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

  // Handle theme changes dynamically
  themeSelect.addEventListener('change', () => {
    const theme = themeSelect.value;
    applyTheme(theme);
  });
});
