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
  passwordField.value = ''; // Ensure no preloaded spaces

  document.getElementById('togglePassword').addEventListener('click', () => {
    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);
    // Toggle the eye icon
    const eyeIcon = document.getElementById('togglePasswordIcon');
    eyeIcon.classList.toggle('fa-eye');
    eyeIcon.classList.toggle('fa-eye-slash');
  });

  document.getElementById('settingsButton').addEventListener('click', () => {
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

  document.getElementById('backButton').addEventListener('click', () => {
    const popupContent = document.getElementById('popupContent');
    const optionsFrame = document.getElementById('optionsFrame');
    const backButton = document.getElementById('backButton');
    optionsFrame.style.display = 'none';
    popupContent.style.display = 'block';
    backButton.style.display = 'none';
  });

  document.getElementById('darkModeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });

  document.getElementById('helpButton').addEventListener('click', () => {
    const popupContent = document.getElementById('popupContent');
    const helpContent = document.getElementById('helpContent');
    if (helpContent.style.display === 'none') {
      helpContent.style.display = 'block';
      popupContent.style.display = 'none';
    } else {
      helpContent.style.display = 'none';
      popupContent.style.display = 'block';
    }
  });

  document.getElementById('feedbackButton').addEventListener('click', () => {
    const popupContent = document.getElementById('popupContent');
    const feedbackContent = document.getElementById('feedbackContent');
    if (feedbackContent.style.display === 'none') {
      feedbackContent.style.display = 'block';
      popupContent.style.display = 'none';
    } else {
      feedbackContent.style.display = 'none';
      popupContent.style.display = 'block';
    }
  });

  document.getElementById('themeButton').addEventListener('click', () => {
    const popupContent = document.getElementById('popupContent');
    const themeContent = document.getElementById('themeContent');
    if (themeContent.style.display === 'none') {
      themeContent.style.display = 'block';
      popupContent.style.display = 'none';
    } else {
      themeContent.style.display = 'none';
      popupContent.style.display = 'block';
    }
  });

  document.getElementById('feedbackForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const feedbackText = document.getElementById('feedbackText').value;
    console.log('Feedback submitted:', feedbackText);
    alert('Thank you for your feedback!');
    document.getElementById('feedbackContent').style.display = 'none';
    document.getElementById('popupContent').style.display = 'block';
  });

  document.getElementById('themeSelector').addEventListener('change', (event) => {
    const theme = event.target.value;
    document.body.className = theme;
  });

  function decryptText(text, passphrase) {
    try {
      const encRegex = /ENC\[(.*?)\]/g;
      let replacedText = text;
      let match;
      let foundEncrypted = false;

      while ((match = encRegex.exec(text)) !== null) {
        const encryptedChunk = match[1];
        const bytes = CryptoJS.AES.decrypt(encryptedChunk, passphrase);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        if (decrypted) {
          foundEncrypted = true;
          replacedText = replacedText.replace(`ENC[${encryptedChunk}]`, `🔓${decrypted}`);
        } else {
          console.error("Decryption failed for chunk:", encryptedChunk);
        }
      }

      return foundEncrypted ? replacedText : "❌ Decryption failed. Incorrect passphrase or corrupted data.";
    } catch (error) {
      console.error("Decryption failed:", error);
      showStatus("❌ Decryption failed.", "error");
      saveErrorLog("Decryption failed: " + error.message);
      return "❌ Decryption failed. Incorrect passphrase or corrupted data.";
    }
  }

  // Example usage: Try logging a message
  addLog("Initialization complete.");
});
