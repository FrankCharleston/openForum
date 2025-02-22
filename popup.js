document.addEventListener("DOMContentLoaded", function () {
    const encryptBtn = document.getElementById("encryptBtn");
    const decryptBtn = document.getElementById("decryptBtn");
    const copyBtn = document.getElementById("copyBtn");
    const togglePassphraseBtn = document.getElementById("togglePassphrase");
    const passphraseInput = document.getElementById("passphrase");
    const textInput = document.getElementById("textInput");
    const output = document.getElementById("output");
    const statusMessage = document.getElementById("statusMessage");
  
    // ✅ Check if CryptoJS is Loaded
    if (typeof CryptoJS === "undefined") {
      console.error("❌ CryptoJS is not loaded!");
      showStatus("⚠️ Encryption library missing!", "error");
      return;
    }
  
    // Toggle passphrase visibility
    if (togglePassphraseBtn) {
      togglePassphraseBtn.addEventListener("click", () => {
        passphraseInput.type = passphraseInput.type === "password" ? "text" : "password";
        togglePassphraseBtn.innerText = passphraseInput.type === "password" ? "👁" : "🙈";
      });
    }
  
    // Handle encrypt/decrypt buttons
    encryptBtn.addEventListener("click", () => processText("encrypt"));
    decryptBtn.addEventListener("click", () => processText("decrypt"));
  
    // Copy output text
    copyBtn.addEventListener("click", () => {
      if (!output.value.trim()) return;
      navigator.clipboard.writeText(output.value)
        .then(() => {
          showStatus("📋 Copied to clipboard!", "success");
        })
        .catch(() => {
          showStatus("❌ Failed to copy.", "error");
        });
    });
  
    // Main logic for encryption/decryption
    function processText(mode) {
      if (!textInput || !passphraseInput) {
        showStatus("⚠️ Missing input fields!", "error");
        return;
      }
  
      const text = textInput.value.trim();
      const passphrase = passphraseInput.value.trim();
  
      if (!text || !passphrase) {
        showStatus("⚠️ Enter text and passphrase.", "error");
        return;
      }
  
      if (mode === "encrypt") {
        output.value = encryptText(text, passphrase);
        showStatus("🔒 Encrypted text generated.", "success");
      } else {
        output.value = decryptText(text, passphrase);
        showStatus("🔓 Decryption attempted.", "success");
      }
    }
  
    function encryptText(text, passphrase) {
      // Append the same message you do in the context menu
      const encrypted = CryptoJS.AES.encrypt(text, passphrase).toString();
      return `ENC[${encrypted}]\n\n🔐 Securely encrypted with OpenForum`;
    }
  
    function decryptText(encryptedText, passphrase) {
      try {
        const raw = encryptedText
          // Only grab what's inside ENC[...] if the user included the appended text
          .replace("ENC[", "")
          .replace("]", "")
          .trim();
        
        const bytes = CryptoJS.AES.decrypt(raw, passphrase);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  
        return decrypted || "❌ Incorrect passphrase or invalid data.";
      } catch (error) {
        console.error("Decryption error:", error);
        return "⚠️ Decryption error.";
      }
    }
  
    // Show a status message and log it
    function showStatus(message, type) {
      statusMessage.textContent = message;
  
      const logList = document.getElementById("logList");
      const logEntry = document.createElement("li");
      logEntry.innerText = message;
  
      switch (type) {
        case "success":
          logEntry.style.color = "green";
          break;
        case "error":
          logEntry.style.color = "red";
          break;
        case "warning":
          logEntry.style.color = "orange";
          break;
        default:
          logEntry.style.color = "black";
      }
  
      logList.appendChild(logEntry);
    }
  
    // Open options page
    document.getElementById("openOptions").addEventListener("click", () => {
      chrome.runtime.openOptionsPage();
    });
  
    // Open errors page
    document.getElementById("openErrors").addEventListener("click", () => {
      chrome.tabs.create({ url: "errors.html" });
    });
  
    // Clear the activity log
    document.getElementById("clearLogBtn").addEventListener("click", () => {
      document.getElementById("logList").innerHTML = "";
      statusMessage.textContent = "";
    });
  });
  