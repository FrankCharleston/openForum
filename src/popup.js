document.getElementById("decryptBtn").addEventListener("click", function () {
    let encryptedMessage = document.getElementById("messageInput").value;
    let passphrase = document.getElementById("passphraseInput").value;

    let decryptedText = decryptWithIV(encryptedMessage, passphrase);
    if (decryptedText) {
        document.getElementById("output").value = decryptedText;
        showSuccess("Decryption successful!");
    } else {
        showError("Decryption failed. Check your passphrase.");
    }
});
