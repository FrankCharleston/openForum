chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "decryptText",
        title: "Decrypt Selected Text",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "decryptText") {
        console.log("Decrypting text:", info.selectionText);

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: decryptSelectedText,
            args: [info.selectionText]
        });
    }
});

function decryptSelectedText(encryptedText) {
    let passphrase = prompt("Enter passphrase:", "mypassword");
    if (!passphrase) return;

    chrome.runtime.sendMessage(
        { action: "decrypt", text: encryptedText, passphrase },
        (response) => {
            if (response && response.decrypted) {
                alert("Decrypted Text: " + response.decrypted);
            } else {
                alert("Decryption failed.");
            }
        }
    );
}
