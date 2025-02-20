// Ensure CryptoJS is available globally (if using externally, include it in manifest.json)
function encryptText(text, passphrase) {
    return CryptoJS.AES.encrypt(text, passphrase).toString();
}

function decryptText(encryptedText, passphrase) {
    try {
        let bytes = CryptoJS.AES.decrypt(encryptedText, passphrase);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error("Decryption failed:", error);
        return null;
    }
}

// Attach functions to window to make them available in content scripts
window.encryptText = function (text, passphrase) {
    if (typeof CryptoJS === "undefined") {
        console.error("CryptoJS is not loaded!");
        return null;
    }
    return CryptoJS.AES.encrypt(text, passphrase).toString();
};

window.decryptText = function (encryptedText, passphrase) {
    if (typeof CryptoJS === "undefined") {
        console.error("CryptoJS is not loaded!");
        return null;
    }
    try {
        let bytes = CryptoJS.AES.decrypt(encryptedText, passphrase);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error("Decryption failed:", error);
        return null;
    }
};
