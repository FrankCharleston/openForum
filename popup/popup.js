document.addEventListener("DOMContentLoaded", () => {
  const encryptBtn = document.getElementById("encryptBtn");
  const decryptBtn = document.getElementById("decryptBtn");
  const copyBtn = document.getElementById("copyBtn");
  const passphraseInput = document.getElementById("passphrase");
  const textInput = document.getElementById("textInput");
  const output = document.getElementById("output");
  const togglePassphraseBtn = document.getElementById("togglePassphrase");

  if (!encryptBtn || !decryptBtn || !copyBtn || !passphraseInput || !textInput || !output) {
    console.error("❌ Missing one or more elements in popup.html.");
    return;
  }

  encryptBtn.addEventListener("click", () => processText("encrypt"));
  decryptBtn.addEventListener("click", () => processText("decrypt"));

  copyBtn.addEventListener("click", () => {
    if (!output.value.trim()) return;
    navigator.clipboard.writeText(output.value + "\n\n🔐 Securely encrypted with OpenForum")
      .then(() => alert("📋 Copied to clipboard!"))
      .catch(() => alert("❌ Copy failed."));
  });

  togglePassphraseBtn.addEventListener("click", () => {
    const type = passphraseInput.getAttribute("type") === "password" ? "text" : "password";
    passphraseInput.setAttribute("type", type);
  });

  function processText(mode) {
    if (!textInput.value.trim() || !passphraseInput.value.trim()) {
      alert("⚠️ Enter text & passphrase.");
      return;
    }

    const text = textInput.value.trim();
    const passphrase = passphraseInput.value.trim();
    output.value = mode === "encrypt" ? encryptText(text, passphrase) : decryptText(text, passphrase);
  }

  function encryptText(text, passphrase) {
    return `ENC[${CryptoJS.AES.encrypt(text, passphrase).toString()}]`;
  }

  function decryptText(text, passphrase) {
    try {
      const encryptedData = text.replace("ENC[", "").replace("]", "").trim();
      const bytes = CryptoJS.AES.decrypt(encryptedData, passphrase);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted || "❌ Decryption failed.";
    } catch (error) {
      console.error("Decryption failed:", error);
      return "❌ Decryption failed.";
    }
  }
});
