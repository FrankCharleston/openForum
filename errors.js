// background.js - Simple Encryption/Decryption Manager with Modal UI

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "encryptText",
        title: "✨ Encrypt Selected Text",
        contexts: ["selection"]
    });
    
    chrome.contextMenus.create({
        id: "decryptText",
        title: "🔓 Decrypt Selected Text",
        contexts: ["selection"]
    });
    
    console.log("[INFO] Context menus created.");
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "encryptText") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: openModal,
            args: ["encrypt", info.selectionText]
        });
    }
    if (info.menuItemId === "decryptText") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: openModal,
            args: ["decrypt", info.selectionText]
        });
    }
});

function openModal(type, text) {
    let modal = document.createElement("div");
    modal.innerHTML = `
        <div id="openForumModal" class="modal">
            <div class="modal-content">
                <span class="close-btn">&times;</span>
                <h2>${type === "encrypt" ? "🔐 Encrypt" : "🔓 Decrypt"} Text</h2>
                <textarea id="modalText" placeholder="${type === "encrypt" ? "Enter text to encrypt" : "Paste encrypted text"}">${text || ""}</textarea>
                <input type="password" id="modalPassphrase" placeholder="Enter passphrase">
                <button id="modalSubmit">${type === "encrypt" ? "Encrypt" : "Decrypt"}</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById("modalSubmit").addEventListener("click", () => {
        let inputText = document.getElementById("modalText").value;
        let passphrase = document.getElementById("modalPassphrase").value;
        if (!inputText.trim() || !passphrase.trim()) {
            alert("⚠️ Please enter text and a passphrase.");
            return;
        }
        let result = type === "encrypt" ? encryptText(inputText, passphrase) : decryptText(inputText, passphrase);
        if (result) {
            navigator.clipboard.writeText(result);
            alert(`✅ ${type === "encrypt" ? "Encrypted" : "Decrypted"} text copied to clipboard!`);
        }
        modal.remove();
    });
    document.querySelector(".close-btn").addEventListener("click", () => modal.remove());
}

function encryptText(text, passphrase) {
    return `ENC[${CryptoJS.AES.encrypt(text, passphrase).toString()}]`;
}

function decryptText(encryptedText, passphrase) {
    try {
        let bytes = CryptoJS.AES.decrypt(encryptedText.replace("ENC[", "").replace("]", ""), passphrase);
        return bytes.toString(CryptoJS.enc.Utf8) || "❌ Incorrect passphrase.";
    } catch (error) {
        return "⚠️ Decryption error.";
    }
}
