# **OpenForum** 🔐  
*A browser extension for encrypted communication on public forums.*  

## **📜 Overview**  
OpenForum is a **browser extension** that allows users to **encrypt and decrypt messages** directly on webpages. It ensures **private communication** on public forums.  

### **🌟 Features**
✔️ **Inline Encryption & Decryption** (Auto-decrypt or manual)  
✔️ **Clipboard Integration** (Encrypt/decrypt copied text)  
✔️ **Context Menu Options** (Right-click to encrypt/decrypt selected text)  
✔️ **Auto Decrypt** (Automatically decrypts messages on page load)  
✔️ **Customizable UI** (Light/Dark/System themes)  
✔️ **Activity Logs & Debugging Mode** (View logs of all actions)  

---

## **📁 Project Structure**  

OPENFORUM [WSL: UBUNTU] │── .github/workflows/ # GitHub Actions & CI/CD automation │ ├── dependency-check.yml │ ├── dependency.yml │ ├── pre-commit.yml │ ├── tf-docs.yml │ ├── assets/ # Icons for extension │ ├── icon-16.png │ ├── icon-48.png │ ├── icon-128.png │ ├── icon-enabled-16.png │ ├── icon-enabled-48.png │ ├── icon-enabled-128.png │ ├── css/ # Stylesheets │ ├── styles.css │ ├── lib/ # Libraries and scripts │ ├── background.js # Handles background processes │ ├── content_script.js # Runs on webpages for inline decryption │ ├── crypto-js.min.js # Cryptographic functions (AES) │ ├── version.js # Version control │ ├── options/ # Options/settings page │ ├── options.html │ ├── options.js │ ├── popup/ # Popup window (main UI) │ ├── popup.html │ ├── popup.js │ ├── .gitignore # Git ignored files ├── manifest.json # Extension manifest ├── package-lock.json # NPM dependency lockfile ├── package.json # NPM package info ├── README.md # Project documentation

yaml
Copy
Edit

---

## **🚀 Installation (Development Mode)**  

### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/YourUsername/OpenForum.git
cd OpenForum
2️⃣ Load the Extension in Your Browser
Open Chrome/Edge and go to:
chrome://extensions/ (Chrome)
edge://extensions/ (Edge)
Enable Developer Mode (top-right toggle).
Click Load Unpacked and select the OpenForum directory.
Done! The extension is now installed.
🔑 How to Use
🔐 Encrypting a Message
Open the OpenForum popup by clicking the extension icon.
Enter your text & passphrase, then click Encrypt.
The encrypted message (e.g., ENC[...]) is ready to copy.
🔓 Decrypting a Message
Paste an encrypted message (ENC[...]) into the text field.
Enter the same passphrase used for encryption.
Click Decrypt to reveal the original message.
📋 Context Menu (Right-Click)
Encrypt Selected Text: Right-click on any text → Select "Encrypt Selected Text".
Decrypt Selected Text: Right-click on an encrypted message → Select "Decrypt Selected Text".
⚙️ Settings & Options
Auto Decrypt: Automatically decrypts messages on page load.
Default Passphrase: Saves a default passphrase for quick decryption.
Theme: Light, Dark, or System-based appearance.
Activity Logs: View logs of encrypted/decrypted actions.
Save Logs: Exports logs to a file.
Clear Logs: Deletes all logs.
Enable Debug Mode: Displays additional logs in the console and options page.
🔄 Features & Functionalities
✅ AES-256 Encryption using crypto-js library.
✅ Auto Decryption for seamless forum browsing.
✅ Clipboard Integration (Copy encrypted/decrypted messages).
✅ Persistent Settings stored in chrome.storage.local.
✅ Debugging Mode (View error logs in the options page).
✅ Customizable Themes (Light, Dark, System).

📌 Development & Contribution
Running in Development Mode
Install dependencies:
sh
Copy
Edit
npm install
Run the extension:
Open chrome://extensions/ → Reload the extension.
Open the popup or options page to test UI changes.
Making Changes
Create a new feature branch:
sh
Copy
Edit
git checkout -b feature/my-new-feature
Make your changes and commit:
sh
Copy
Edit
git commit -m "Added new encryption feature"
Push and open a Pull Request.
🔧 Troubleshooting
❌ Common Issues & Fixes
Issue	Solution
Context menu options not appearing?	Reload the extension in chrome://extensions/
Auto-decrypt not working?	Ensure Auto Decrypt is enabled in options.
Decryption fails?	Verify you're using the correct passphrase.
Nothing happens when encrypting?	Check for browser console errors (F12 → Console).
Logs not appearing?	Enable Debug Mode in the options page.
📜 License
This project is licensed under the MIT License.

🎉 Thank you for using OpenForum! 🚀
For feedback or contributions, visit the GitHub Repository.
