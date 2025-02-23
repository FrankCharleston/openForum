document.addEventListener('DOMContentLoaded', () => {
  // === DOM references ===
  const autoDecryptSelect      = document.getElementById('autoDecrypt');
  const defaultPassphraseInput = document.getElementById('defaultPassphrase');
  const themeSelect            = document.getElementById('theme');
  const debugModeSelect        = document.getElementById('debugMode');
  const saveSettingsButton     = document.getElementById('saveSettings');

  // Log-related elements
  const activityLogBtn         = document.getElementById('activityLogBtn');
  const activityLogDiv         = document.getElementById('activityLog');

  const debugLogBtn            = document.getElementById('debugLogBtn');
  const debugLogDiv            = document.getElementById('debugLog');

  const errorLogsBtn           = document.getElementById('errorLogsBtn');
  const errorLogsDiv           = document.getElementById('errorLogs');

  const exportLogsButton       = document.getElementById('exportLogsBtn');
  const checkUpdatesButton     = document.getElementById('checkUpdatesBtn');

  // ================================
  // 1) LOAD EXISTING SETTINGS
  // ================================
  chrome.storage.local.get(
    ['autoDecrypt', 'defaultPassphrase', 'theme', 'debugMode', 'decryptionErrors'],
    (data) => {
      autoDecryptSelect.value       = data.autoDecrypt ? 'true' : 'false';
      defaultPassphraseInput.value  = data.defaultPassphrase || '';
      themeSelect.value             = data.theme || 'system';
      debugModeSelect.value         = data.debugMode ? 'true' : 'false';

      // Display any existing error logs in the "errorLogs" div
      displayErrorLogs(data.decryptionErrors || []);

      // Apply the theme to this page
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

    chrome.storage.local.set(
      { autoDecrypt, defaultPassphrase, theme, debugMode },
      () => {
        alert('Settings saved successfully!');
        applyTheme(theme); // re-apply theme in case user changed it
      }
    );
  });

  // ================================
  // 3) LOG DISPLAYS & BUTTON HANDLERS
  // ================================
  // Example: show/hide or clear the "activityLog" div
  activityLogBtn.addEventListener('click', () => {
    // For demonstration, toggle the display of activityLogDiv or clear it
    alert('Activity log button clicked (placeholder).');
    // activityLogDiv.innerHTML = ''; // If you want to clear
  });

  debugLogBtn.addEventListener('click', () => {
    alert('Debug log button clicked (placeholder).');
    // debugLogDiv.innerHTML = '';
  });

  errorLogsBtn.addEventListener('click', () => {
    // Clear error logs from storage, then clear the display
    chrome.storage.local.set({ decryptionErrors: [] }, () => {
      displayErrorLogs([]);
      alert('Error logs cleared.');
    });
  });

  // Export logs
  exportLogsButton.addEventListener('click', () => {
    // In a real implementation, fetch logs from storage, format them, etc.
    alert('Logs exported (placeholder).');
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

  // ================================
  // 4) HELPER: DISPLAY ERROR LOGS
  // ================================
  function displayErrorLogs(logs) {
    // Populate the "errorLogsDiv" with your logs
    errorLogsDiv.innerHTML = logs.map(log => {
      const isError = log.error.toLowerCase().includes('error');
      return `
        <div class="log-entry ${isError ? 'error' : 'success'}">
          <strong>${log.timestamp}</strong>: ${log.error}
        </div>
      `;
    }).join('');
  }

  // ================================
  // 5) THEME HANDLING
  // ================================
  function applyTheme(theme) {
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

  // Optional: re-apply theme on user selection change
  themeSelect.addEventListener('change', () => {
    applyTheme(themeSelect.value);
  });
});
