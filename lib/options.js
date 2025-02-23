document.addEventListener('DOMContentLoaded', () => {
  // === DOM references ===
  const autoDecryptSelect      = document.getElementById('autoDecrypt');
  const defaultPassphraseInput = document.getElementById('defaultPassphrase');
  const themeSelect            = document.getElementById('theme');
  const debugModeSelect        = document.getElementById('debugMode');
  const saveSettingsButton     = document.getElementById('saveSettings');
  const toggleDefaultPassphraseBtn = document.getElementById('toggleDefaultPassphrase');

  // Log-related elements
  const activityLogBtn         = document.getElementById('activityLogBtn');
  const activityLogDiv         = document.getElementById('activityLog');

  const debugLogBtn            = document.getElementById('debugLogBtn');
  const debugLogDiv            = document.getElementById('debugLog');

  const errorLogsBtn           = document.getElementById('errorLogsBtn');
  const errorLogsDiv           = document.getElementById('errorLogs');

  const exportLogsButton       = document.getElementById('exportLogsBtn');
  const checkUpdatesButton     = document.getElementById('checkUpdatesBtn');

  // Ensure elements exist before appending to the container
  if (autoDecryptSelect && defaultPassphraseInput && themeSelect && debugModeSelect && saveSettingsButton && toggleDefaultPassphraseBtn && activityLogBtn && activityLogDiv && debugLogBtn && debugLogDiv && errorLogsBtn && errorLogsDiv && exportLogsButton && checkUpdatesButton) {
    // Add CSS to center the options and make them visible
    const style = document.createElement('style');
    style.innerHTML = `
      body {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
      }
      .options-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 600px;
      }
      .options-container > * {
        margin: 10px 0;
      }
    `;
    document.head.appendChild(style);

    // Wrap existing elements in a container
    const container = document.createElement('div');
    container.className = 'options-container';
    document.body.appendChild(container);
    container.appendChild(autoDecryptSelect.parentElement);
    container.appendChild(defaultPassphraseInput.parentElement);
    container.appendChild(themeSelect.parentElement);
    container.appendChild(debugModeSelect.parentElement);
    container.appendChild(saveSettingsButton.parentElement);
    container.appendChild(toggleDefaultPassphraseBtn.parentElement);
    container.appendChild(activityLogBtn.parentElement);
    container.appendChild(activityLogDiv.parentElement);
    container.appendChild(debugLogBtn.parentElement);
    container.appendChild(debugLogDiv.parentElement);
    container.appendChild(errorLogsBtn.parentElement);
    container.appendChild(errorLogsDiv.parentElement);
    container.appendChild(exportLogsButton.parentElement);
    container.appendChild(checkUpdatesButton.parentElement);
  }

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

      // Enable/disable default passphrase input based on autoDecrypt setting
      toggleDefaultPassphraseInput(data.autoDecrypt);
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
        toggleDefaultPassphraseInput(autoDecrypt); // Enable/disable default passphrase input
      }
    );
  });

  // ================================
  // 3) LOG DISPLAYS & BUTTON HANDLERS
  // ================================
  activityLogBtn.addEventListener('click', () => {
    activityLogDiv.classList.toggle('hidden');
  });

  debugLogBtn.addEventListener('click', () => {
    debugLogDiv.classList.toggle('hidden');
  });

  errorLogsBtn.addEventListener('click', () => {
    chrome.storage.local.set({ decryptionErrors: [] }, () => {
      displayErrorLogs([]);
      alert('Error logs cleared.');
    });
  });

  exportLogsButton.addEventListener('click', () => {
    chrome.storage.local.get(['decryptionErrors'], (data) => {
      const logs = data.decryptionErrors || [];
      const logString = logs.map(log => `${log.timestamp}: ${log.error}`).join('\n');
      const blob = new Blob([logString], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'decryption_logs.txt';
      a.click();
      URL.revokeObjectURL(url);
      alert('Logs exported successfully.');
    });
  });

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
  // 4) TOGGLE DEFAULT PASSPHRASE VISIBILITY
  // ================================
  toggleDefaultPassphraseBtn.addEventListener('click', () => {
    const type = defaultPassphraseInput.type === 'password' ? 'text' : 'password';
    defaultPassphraseInput.type = type;
    toggleDefaultPassphraseBtn.textContent = type === 'password' ? '👁' : '🙈';
  });

  // ================================
  // 5) HELPER: DISPLAY ERROR LOGS
  // ================================
  function displayErrorLogs(logs) {
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
  // 6) THEME HANDLING
  // ================================
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else if (theme === 'light') {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    } else {
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

  themeSelect.addEventListener('change', () => {
    applyTheme(themeSelect.value);
  });

  // ================================
  // 7) TOGGLE DEFAULT PASSPHRASE INPUT
  // ================================
  function toggleDefaultPassphraseInput(enable) {
    defaultPassphraseInput.disabled = !enable;
    toggleDefaultPassphraseBtn.disabled = !enable;
  }

  autoDecryptSelect.addEventListener('change', () => {
    toggleDefaultPassphraseInput(autoDecryptSelect.value === 'true');
  });
});
