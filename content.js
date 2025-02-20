/* ==============================
   📌 content.js - Injects Decryption Logic into Web Pages
   ============================== */

   console.log("[DEBUG] Content script loaded");

   // Function to scan page for encrypted text & decrypt it
   function scanAndDecrypt() {
       console.log("[DEBUG] Scanning page for encrypted messages...");
       document.querySelectorAll("*").forEach(element => {
           const encryptedText = extractEncryptedText(element.innerText);
           if (encryptedText) {
               console.log("[DEBUG] Found encrypted text:", encryptedText);
               decryptMessage(encryptedText, (decrypted) => {
                   if (decrypted) {
                       console.log("[DEBUG] Decrypted text:", decrypted);
                       element.innerHTML = element.innerHTML.replace(
                           `ENC[${encryptedText}]`,
                           `<span class='decrypted-message' style='color: green;'>${decrypted}</span>`
                       );
                   } else {
                       console.warn("[WARN] Decryption failed for:", encryptedText);
                   }
               });
           }
       });
   }
   
   // Extract encrypted text from elements
   function extractEncryptedText(text) {
       const match = text.match(/ENC\[(.*?)\]/);
       return match ? match[1] : null;
   }
   
   // Decryption function
   function decryptMessage(encryptedText, callback) {
       try {
           console.log("[DEBUG] Attempting to decrypt:", encryptedText);
           let passphrase = prompt("Enter decryption passphrase:", "mypassword");
           if (!passphrase) return;
   
           const decrypted = CryptoJS.AES.decrypt(encryptedText, passphrase);
           const plainText = decrypted.toString(CryptoJS.enc.Utf8);
   
           if (plainText) {
               callback(plainText);
           } else {
               console.warn("[WARN] Decryption failed: Incorrect passphrase or corrupted input.");
               callback(null);
           }
       } catch (e) {
           console.error("[ERROR] Decryption error:", e);
           callback(null);
       }
   }
   
   // Run decryption when page loads
   document.addEventListener("DOMContentLoaded", scanAndDecrypt);
   