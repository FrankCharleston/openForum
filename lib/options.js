document.addEventListener('DOMContentLoaded', () => {
  // === DOM references ===
  const autoDecryptSelect       = document.getElementById('autoDecrypt');
  const defaultPassphraseInput  = document.getElementById('defaultPassphrase');
  const themeSelect             = document.getElementById('theme');
  const debugModeSelect         = document.getElementById('debugMode');
  const saveSettingsButton      = document.getElementById('saveSettings');

  // Log-related elements
  const errorLogsDiv            = document.getElementById('errorLogs');
  const clearErrorLogsButton    = document.getElementById('clearErrorLogs');
  const clearActivityLogButton  = document.getElementById('clearActivityLog');
  const clearDebugLogButton     = document.getElementById('clearDebugLog');
  const exportLogsButton        = document.getElementById('exportLogsBtn');
  const checkUpdatesButton      = document.getElementById('checkUpdatesBtn');

  // ================================
  // 1) LOAD EXISTING SETTINGS
  // ================================
  chrome.storage.local.get(
    ['autoDecrypt', 'defaultPassphrase', 'theme', 'debugMode', 'decryptionErrors'],
    (data) => {
      // Apply or default to 'false' if not set
      autoDecryptSelect.value      = data.autoDecrypt ? 'true' : 'false';
      defaultPassphraseInput.value = data.defaultPassphrase || '';
      themeSelect.value            = data.theme || 'system';
      debugModeSelect.value        = data.debugMode ? 'true' : 'false';

      // Display any existing error logs
      displayErrorLogs(data.decryptionErrors || []);

      // Apply the current theme to the Options page
      applyTheme(data.theme || 'system');
    }
  );

  // ================================
  // 2) SAVE SETTINGS
  // ================================
  saveSettingsButton.addEventListener('click', () => {
    const autoDecrypt     = (autoDecryptSelect.value === 'true');
    const defaultPassphrase = defaultPassphraseInput.value;
    const theme           = themeSelect.value;
    const debugMode       = (debugModeSelect.value === 'true');

    // Persist in chrome.storage.local
    chrome.storage.local.set(
      { autoDecrypt, defaultPassphrase, theme, debugMode },
      () => {
        alert('Settings saved successfully!');
        // Re-apply theme in case it changed
        applyTheme(theme);
      }
    );
  });

  // ================================
  // 3) DISPLAY ERROR LOGS
  // ================================
  function displayErrorLogs(logs) {
    errorLogsDiv.innerHTML = logs.map(log => {
      // If the log message includes 'error', mark it as error style
      const isError = log.error.toLowerCase().includes('error');
      return `
        <div class="log-entry ${isError ? 'error' : 'success'}">
          <strong>${log.timestamp}</strong>: ${log.error}
        </div>
      `;
    }).join('');
  }

  // ================================
  // 4) CLEAR LOGS
  // ================================
  // Clear error logs
  clearErrorLogsButton.addEventListener('click', () => {
    chrome.storage.local.set({ decryptionErrors: [] }, () => {
      displayErrorLogs([]);
      alert('Error logs cleared.');
    });
  });

  // Clear activity log
  clearActivityLogButton.addEventListener('click', () => {
    // You might have an array or object for activity logs in storage.
    // Example: chrome.storage.local.set({ activityLogs: [] }, ...)
    // For now, just show an alert:
    alert('Activity log cleared (placeholder).');
  });

  // Clear debug log
  clearDebugLogButton.addEventListener('click', () => {
    // Similarly, if you store debug logs, clear them from storage here.
    alert('Debug log cleared (placeholder).');
  });

  // ================================
  // 5) EXPORT LOGS
  // ================================
  exportLogsButton.addEventListener('click', () => {
    // In a real implementation, you’d fetch all logs from storage,
    // then convert them to JSON, CSV, or your desired format, and
    // prompt the user to save a file. For now:
    alert('Logs exported (placeholder).');
  });

  // ================================
  // 6) CHECK FOR UPDATES
  // ================================
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

  // ================================
  // 7) THEME HANDLING
  // ================================
  function applyTheme(theme) {
    // If user explicitly chooses dark or light, set it:
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else if (theme === 'light') {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    } else {
      // System default
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
      } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
      }
    }
  }

  // Handle user switching theme in real-time
  themeSelect.addEventListener('change', () => {
    const theme = themeSelect.value;
    applyTheme(theme);
  });
});
