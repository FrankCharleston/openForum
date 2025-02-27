# **OpenForum** 🔐  
*A browser extension for encrypted communication on public forums.*  

## **📜 Overview**  
OpenForum is a **browser extension** that **encrypts and decrypts messages** directly on webpages, allowing users to communicate **privately** while using public forums.  

It supports:  
✔️ **Inline Encryption & Decryption** (Auto-decrypt or manual)  
✔️ **Clipboard Integration** (Encrypt/decrypt copied text)  
✔️ **Context Menu Options** (Right-click to encrypt/decrypt selected text)  
✔️ **Customizable UI** (Light/Dark/System themes)  
✔️ **Activity Logs** (Track actions within the extension)  

---

## **📁 Project Structure**  

```
OPENFORUM [WSL: UBUNTU]
│── .github/workflows/          # GitHub Actions & CI/CD automation
│   ├── dependency-check.yml
│   ├── dependency.yml
│   ├── pre-commit.yml
│   ├── tf-docs.yml
│
├── assets/                     # Icons for extension
│   ├── icon-16.png
│   ├── icon-48.png
│   ├── icon-128.png
│   ├── icon-enabled-16.png
│   ├── icon-enabled-48.png
│   ├── icon-enabled-128.png
│
├── css/                        # Stylesheets
│   ├── styles.css
│
├── lib/                        # Libraries and scripts
│   ├── background.js           # Handles background processes
│   ├── content_script.js       # Runs on webpages for inline decryption
│   ├── crypto-js.min.js        # Cryptographic functions (AES)
│   ├── version.js              # Version control
│
├── options/                    # Options/settings page
│   ├── options.html
│   ├── options.js
│
├── popup/                      # Popup window (main UI)
│   ├── popup.html
│   ├── popup.js
│
├── .gitignore                   # Git ignored files
├── manifest.json                # Extension manifest
├── package-lock.json            # NPM dependency lockfile
├── package.json                 # NPM package info
├── README.md                    # Project documentation
```

---

## **🚀 Installation (Development Mode)**  

### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/YourUsername/OpenForum.git
cd OpenForum
```

### **2️⃣ Load the Extension in Your Browser**
1. Open **Chrome/Edge** and go to:  
   - `chrome://extensions/` (Chrome)  
   - `edge://extensions/` (Edge)  
2. Enable **Developer Mode** (top-right toggle).  
3. Click **Load Unpacked** and select the **OpenForum** directory.  
4. **Done!** The extension is now installed.

---

## **🔑 How to Use**
### **🔐 Encrypting a Message**
1. Open the **OpenForum popup** by clicking the extension icon.  
2. Enter your **text & passphrase**, then click **Encrypt**.  
3. The encrypted message (e.g., `ENC[...]`) is **ready to copy**.  

### **🔓 Decrypting a Message**
1. Paste an **encrypted message (`ENC[...]`)** into the text field.  
2. Enter the **same passphrase** used for encryption.  
3. Click **Decrypt** to reveal the original message.

### **📋 Context Menu (Right-Click)**
- **Encrypt Selected Text**: Right-click on any text → Select **"Encrypt Selected Text"**.  
- **Decrypt Selected Text**: Right-click on an encrypted message → Select **"Decrypt Selected Text"**.  

---

## **⚙️ Settings & Options**
- **Auto Decrypt**: Automatically decrypts messages on page load.  
- **Default Passphrase**: Saves a default passphrase for quick decryption.  
- **Theme**: Light, Dark, or System-based appearance.  
- **Activity Logs**: View logs of encrypted/decrypted actions.  
- **Save Logs**: Exports logs to a file.  
- **Clear Logs**: Deletes all logs.

---

## **🔄 Features & Functionalities**
✅ **AES-256 Encryption** using `crypto-js` library.  
✅ **Auto Decryption** for seamless forum browsing.  
✅ **Clipboard Integration** (Copy encrypted/decrypted messages).  
✅ **Persistent Settings** stored in `chrome.storage.local`.  
✅ **Debugging Mode** (View error logs in the options page).  
✅ **Customizable Themes** (Light, Dark, System).  

---

## **📌 Development & Contribution**
### **Running in Development Mode**
1. Install dependencies:
   ```sh
   npm install
   ```
2. Run the extension:
   - Open `chrome://extensions/` → Reload the extension.  
   - Open the **popup** or **options page** to test UI changes.  

### **Making Changes**
1. Create a new feature branch:
   ```sh
   git checkout -b feature/my-new-feature
   ```
2. Make your changes and commit:
   ```sh
   git commit -m "Added new encryption feature"
   ```
3. Push and open a **Pull Request**.

---

## **📜 License**
This project is licensed under the **MIT License**.  

---

**🎉 Thank you for using OpenForum!** 🚀