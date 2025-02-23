document.addEventListener("DOMContentLoaded", () => {
  if (typeof CryptoJS === "undefined") {
    console.error("❌ CryptoJS is not loaded!");
    alert("⚠️ Encryption library missing!");
    return;
  }

  const textInput = document.getElementById("textInput");
  const passphraseInput = document.getElementById("password");
  const output = document.getElementById("output");

  function encryptText(text, passphrase) {
    return `ENC[${CryptoJS.AES.encrypt(text, passphrase).toString()}]`;
  }

  function decryptText(text, passphrase) {
    const match = text.match(/ENC\[(.*?)\]/);
    if (!match) return "❌ No valid encrypted text found.";
    const bytes = CryptoJS.AES.decrypt(match[1], passphrase);
    return bytes.toString(CryptoJS.enc.Utf8) || "❌ Incorrect passphrase.";
  }

  document.getElementById("encryptBtn")?.addEventListener("click", () => {
    output.value = encryptText(textInput.value, passphraseInput.value);
  });

  document.getElementById("decryptBtn")?.addEventListener("click", () => {
    output.value = decryptText(textInput.value, passphraseInput.value);
  });

  document.getElementById("copyBtn")?.addEventListener("click", () => {
    navigator.clipboard.writeText(output.value).then(() => alert("📋 Copied!"));
  });

  document.getElementById("togglePassword")?.addEventListener("click", () => {
    passphraseInput.type = passphraseInput.type === "password" ? "text" : "password";
  });

  document.getElementById("clearLogBtn")?.addEventListener("click", () => {
    output.value = "";
    textInput.value = "";
  });

  document.getElementById("openOptions")?.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });
});
