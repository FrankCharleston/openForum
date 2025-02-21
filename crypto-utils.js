if (typeof CryptoJS === "undefined") {
    console.error("CryptoJS is not loaded! Make sure it's included in popup.html.");
}

// Define encryption function
window.encryptText = function (text, passphrase) {
    if (typeof CryptoJS === "undefined") {
        console.error("CryptoJS is not loaded!");
        return null;
    }
    return CryptoJS.AES.encrypt(text, passphrase).toString();
};

// Define decryption function
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
if (typeof CryptoJS === "undefined") {
    console.error("CryptoJS is not loaded! Make sure it's included in popup.html.");
}

// Define encryption function
window.encryptText = function (text, passphrase) {
    if (typeof CryptoJS === "undefined") {
        console.error("CryptoJS is not loaded!");
        return null;
    }
    return CryptoJS.AES.encrypt(text, passphrase).toString();
};

// Define decryption function
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
