document.addEventListener('DOMContentLoaded', () => {
  fetch(chrome.runtime.getURL('manifest.json'))
    .then(response => response.json())
    .then(manifest => {
      document.getElementById('version').textContent = manifest.version;
    });
});
