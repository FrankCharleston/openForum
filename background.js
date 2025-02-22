/*****************************************************
 * background.js - Right Click Encryption/Decryption *
 *****************************************************/

/**
 * Example context menu setup. 
 * (You can create your menus in onInstalled or onStartup)
 */
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "encryptText",
      title: "Encrypt Selected Text",
      contexts: ["selection"]
    });
  
    chrome.contextMenus.create({
      id: "decryptText",
      title: "Decrypt Selected Text",
      contexts: ["selection"]
    });
  
    console.log("Context menus created.");
  });
  
  /**
   * When a user clicks a context menu item, we do two steps:
   *  1) Inject crypto-js.min.js into the page so CryptoJS is defined.
   *  2) Inject our encryption/decryption function.
   */
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "encryptText") {
      // Step 1: Inject crypto-js
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          files: ["crypto-js.min.js"] // make sure this file is in your extension
        },
        () => {
          // Step 2: Now run the actual encryption code
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: encryptSelectedText,
            args: [info.selectionText]
          });
        }
      );
    } 
    else if (info.menuItemId === "decryptText") {
      // Step 1: Inject crypto-js
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          files: ["crypto-js.min.js"]
        },
        () => {
          // Step 2: Now run the actual decryption code
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: decryptSelectedText,
            args: [info.selectionText]
          });
        }
      );
    }
  });
  
  /**
   * encryptSelectedText(text)
   * - Runs in the page context after crypto-js is injected
   * - Prompts for passphrase, encrypts, and copies to clipboard
   * - Includes the "🔐 Securely encrypted with OpenForum" line
   */
  function encryptSelectedText(text) {
    if (!text || text.trim() === "") {
      alert("No text selected for encryption.");
      return;
    }
    let passphrase = prompt("Enter passphrase to encrypt:");
    if (!passphrase) return;
  
    // This line needs CryptoJS, which is why we injected crypto-js.min.js first
    let encrypted = CryptoJS.AES.encrypt(text.trim(), passphrase).toString();
  
    // Add the extra message to the copied text
    let formattedMessage = `ENC[${encrypted}]
  
  🔐 Securely encrypted with OpenForum`;
  
    navigator.clipboard.writeText(formattedMessage).then(() => {
      alert("Encrypted text copied to clipboard.");
    }).catch(() => {
      alert("Failed to copy encrypted text.");
    });
  }
  
  /**
   * decryptSelectedText(text)
   * - Runs in the page context after crypto-js is injected
   * - Prompts for passphrase (or uses a stored default)
   * - Logs errors to storage if decryption fails
   */
  function decryptSelectedText(text) {
    if (!text || !text.startsWith("ENC[")) {
      alert("No valid encrypted text selected.");
      return;
    }
    chrome.storage.local.get("defaultPassphrase", (data) => {
      let passphrase = data.defaultPassphrase || prompt("Enter passphrase to decrypt:");
      if (!passphrase) return;
  
      try {
        let encryptedData = text.replace("ENC[", "").replace("]", "").trim();
        let bytes = CryptoJS.AES.decrypt(encryptedData, passphrase);
        let decrypted = bytes.toString(CryptoJS.enc.Utf8);
  
        if (decrypted) {
          alert("Decrypted Text: " + decrypted);
        } else {
          alert("Decryption failed. Incorrect passphrase or corrupted data.");
        }
      } catch (error) {
        console.error("Decryption failed:", error);
        chrome.storage.local.get("decryptionErrors", (data) => {
          let errors = data.decryptionErrors || [];
          errors.push({ timestamp: new Date().toISOString(), error: error.message });
          chrome.storage.local.set({ decryptionErrors: errors });
        });
        alert("Decryption error. Ensure the text is correctly formatted.");
      }
    });
  }
  