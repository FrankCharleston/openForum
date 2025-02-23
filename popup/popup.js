document.addEventListener('DOMContentLoaded', () => {
  // Example: Define the addLog function that uses logList
  function addLog(message) {
    const logList = document.getElementById('logList');
    if (!logList) {
      console.error("logList element not found");
      return;
    }
    const li = document.createElement('li');
    li.textContent = message;
    logList.appendChild(li);
  }

  // Existing code for toggling password visibility, settings, dark mode, etc.
  const passwordField = document.getElementById('password');
  if (passwordField) passwordField.value = ''; // Ensure no preloaded spaces

  document.getElementById('togglePassword')?.addEventListener('click', () => {
    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);
    // Toggle the eye icon
    const eyeIcon = document.getElementById('togglePasswordIcon');
    eyeIcon?.classList.toggle('fa-eye');
    eyeIcon?.classList.toggle('fa-eye-slash');
  });

  document.getElementById('settingsButton')?.addEventListener('click', () => {
    const popupContent = document.getElementById('popupContent');
    const optionsFrame = document.getElementById('optionsFrame');
    const backButton = document.getElementById('backButton');
    if (optionsFrame.style.display === 'none') {
      optionsFrame.style.display = 'block';
      popupContent.style.display = 'none';
      backButton.style.display = 'inline-block';
    } else {
      optionsFrame.style.display = 'none';
      popupContent.style.display = 'block';
      backButton.style.display = 'none';
    }
  });

  document.getElementById('backButton')?.addEventListener('click', () => {
    const popupContent = document.getElementById('popupContent');
    const optionsFrame = document.getElementById('optionsFrame');
    const backButton = document.getElementById('backButton');
    optionsFrame.style.display = 'none';
    popupContent.style.display = 'block';
    backButton.style.display = 'none';
  });

  document.getElementById('darkModeToggle')?.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });

  document.getElementById('helpButton')?.addEventListener('click', () => {
    const popupContent = document.getElementById('popupContent');
    const helpContent = document.getElementById('helpContent');
    helpContent.style.display = helpContent.style.display === 'none' ? 'block' : 'none';
    popupContent.style.display = helpContent.style.display === 'none' ? 'block' : 'none';
  });

  document.getElementById('feedbackButton')?.addEventListener('click', () => {
    const popupContent = document.getElementById('popupContent');
    const feedbackContent = document.getElementById('feedbackContent');
    feedbackContent.style.display = feedbackContent.style.display === 'none' ? 'block' : 'none';
    popupContent.style.display = feedbackContent.style.display === 'none' ? 'block' : 'none';
  });

  document.getElementById('themeButton')?.addEventListener('click', () => {
    const popupContent = document.getElementById('popupContent');
    const themeContent = document.getElementById('themeContent');
    themeContent.style.display = themeContent.style.display === 'none' ? 'block' : 'none';
    popupContent.style.display = themeContent.style.display === 'none' ? 'block' : 'none';
  });

  document.getElementById('feedbackForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const feedbackText = document.getElementById('feedbackText').value;
    console.log('Feedback submitted:', feedbackText);
    alert('Thank you for your feedback!');
    document.getElementById('feedbackContent').style.display = 'none';
    document.getElementById('popupContent').style.display = 'block';
  });

  document.getElementById('themeSelector')?.addEventListener('change', (event) => {
    const theme = event.target.value;
    document.body.className = theme;
  });

  function decryptText(text, passphrase) {
    try {
      const encRegex = /ENC\[(.*?)\]/;
      const match = text.match(encRegex);
      
      if (!match || match.length < 2) {
        console.error("No valid encrypted text found.");
        return "❌ No valid encrypted text found.";
      }

      const encryptedChunk = match[1]; // Extract the encrypted content
      const bytes = CryptoJS.AES.decrypt(encryptedChunk, passphrase);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      if (!decrypted) {
        console.error("Decryption failed: Invalid passphrase or corrupted data.");
        return "❌ Decryption failed. Incorrect passphrase or corrupted data.";
      }

      return `🔓 ${decrypted}`;
    } catch (error) {
      console.error("Decryption failed:", error);
      showStatus("❌ Decryption failed.", "error");
      saveErrorLog("Decryption failed: " + error.message);
      return "❌ Decryption failed. Incorrect passphrase or corrupted data.";
    }
  }

  function showStatus(message, type) {
    const statusMessage = document.getElementById("statusMessage");
    if (!statusMessage) return;
    statusMessage.textContent = message;
    statusMessage.className = type;
    setTimeout(() => {
      statusMessage.textContent = "";
      statusMessage.className = "";
    }, 3000);
  }

  function saveErrorLog(message) {
    chrome.storage.local.get("decryptionErrors", (data) => {
      const errors = data.decryptionErrors || [];
      errors.push({
        timestamp: new Date().toISOString(),
        error: message
      });
      chrome.storage.local.set({ decryptionErrors: errors });
    });
  }

  // Example usage: Try logging a message
  addLog("Initialization complete.");
});
