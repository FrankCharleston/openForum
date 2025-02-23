document.addEventListener('DOMContentLoaded', () => {
  const encryptBtn = document.getElementById("encryptBtn");
  const decryptBtn = document.getElementById("decryptBtn");
  const copyBtn = document.getElementById("copyBtn");
  const passphraseInput = document.getElementById("passphrase");
  const textInput = document.getElementById("textInput");
  const output = document.getElementById("output");

  encryptBtn?.addEventListener("click", () => processText("encrypt"));
  decryptBtn?.addEventListener("click", () => processText("decrypt"));
  copyBtn?.addEventListener("click", () => {
    if (!output.value.trim()) return;
    navigator.clipboard.writeText(output.value).then(() => alert("Copied to clipboard!"));
  });

  function processText(mode) {
    if (!textInput.value.trim() || !passphraseInput.value.trim()) return alert("Enter text & passphrase.");
    const text = textInput.value.trim();
    const passphrase = passphraseInput.value.trim();
    output.value = mode === "encrypt" ? encryptText(text, passphrase) : decryptText(text, passphrase);
  }

  function encryptText(text, passphrase) {
    return `ENC[${CryptoJS.AES.encrypt(text, passphrase).toString()}]`;
  }

  function decryptText(text, passphrase) {
    const encryptedData = text.replace("ENC[", "").replace("]", "").trim();
    return CryptoJS.AES.decrypt(encryptedData, passphrase).toString(CryptoJS.enc.Utf8) || "Decryption failed.";
  }
});
