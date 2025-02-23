document.addEventListener('DOMContentLoaded', () => {
  const logContainer = document.getElementById('logContainer');
  let logList = document.getElementById('logList');

  if (!logList) {
    logList = document.createElement('div');
    logList.id = 'logList';
    logContainer.appendChild(logList);
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message.log) {
      const logEntry = document.createElement('div');
      logEntry.textContent = message.log;
      logList.appendChild(logEntry);
    }
  });

  // Load existing logs from storage if needed
  chrome.storage.local.get('logs', (data) => {
    if (data.logs) {
      data.logs.forEach(log => {
        const logEntry = document.createElement('div');
        logEntry.textContent = log;
        logList.appendChild(logEntry);
      });
    }
  });
});
