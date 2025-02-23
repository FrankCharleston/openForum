document.addEventListener("DOMContentLoaded", () => {
  const autoDecryptSelect = document.getElementById("autoDecrypt");
  const defaultPassphraseInput = document.getElementById("defaultPassphrase");

  chrome.storage.local.get(["autoDecrypt", "defaultPassphrase"], (data) => {
    autoDecryptSelect.value = data.autoDecrypt ? "true" : "false";
    defaultPassphraseInput.value = data.defaultPassphrase || "";
  });

  document.getElementById("saveSettings")?.addEventListener("click", () => {
    chrome.storage.local.set({
      autoDecrypt: autoDecryptSelect.value === "true",
      defaultPassphrase: defaultPassphraseInput.value
    }, () => alert("✅ Settings saved!"));
  });

  document.getElementById("toggleDefaultPassphrase")?.addEventListener("click", () => {
    defaultPassphraseInput.type = defaultPassphraseInput.type === "password" ? "text" : "password";
  });
});
