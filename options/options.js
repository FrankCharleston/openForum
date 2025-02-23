document.addEventListener('DOMContentLoaded', () => {
  const logContainer = document.getElementById('logContainer');

  chrome.runtime.onMessage.addListener((message) => {
    if (message.log) {
      const logEntry = document.createElement('div');
      logEntry.textContent = message.log;
      logContainer.appendChild(logEntry);
    }
  });

  // Load existing logs from storage if needed
  chrome.storage.local.get('logs', (data) => {
    if (data.logs) {
      data.logs.forEach(log => {
        const logEntry = document.createElement('div');
        logEntry.textContent = log;
        logContainer.appendChild(logEntry);
      });
    }
  });
});
