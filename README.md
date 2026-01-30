# 🤖 APEX-MD V2

Advanced WhatsApp Bot built with Baileys

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/pancha2000/APEX-MD-V2)
[![Deploy to Koyeb](https://www.koyeb.com/static/images/deploy/button.svg)](https://app.koyeb.com/deploy)

## ✨ Features

- ✅ Clean & Professional Code
- ✅ Easy Command System
- ✅ Plugin Based Architecture
- ✅ MongoDB Database Support
- ✅ Owner & Sudo System
- ✅ Group Management
- ✅ Auto Read Messages
- ✅ Session Management
- ✅ Error Handling
- ✅ Fast & Stable

## 📋 Requirements

- Node.js 18.x or higher
- MongoDB Database
- WhatsApp Account
- Git

## 🚀 Installation

### Quick Deploy (Recommended for beginners)

#### Deploy to Heroku
1. Click the "Deploy to Heroku" button above
2. Fill in the environment variables (especially SESSION_ID)
3. Click "Deploy"

#### Deploy to Koyeb
1. Get your session from Mega.nz (see [KOYEB_DEPLOY.md](KOYEB_DEPLOY.md))
2. Click "Deploy to Koyeb" button
3. Connect your GitHub repository
4. Add environment variables
5. Deploy!

**📝 Getting Session ID:**
- Upload your `creds.json` file to https://mega.nz
- Get the shareable link (e.g., `https://mega.nz/file/AB1234cd#xyz789abc`)
- Copy only the code after `/file/`: `AB1234cd#xyz789abc`
- Paste that code as SESSION_ID (not the full link!)
- Bot will automatically download and use it!

**Example:**
```env
SESSION_ID=AB1234cd#xyz789abc
```

### Method 1: Local Deployment

1. Clone the repository:
```bash
git clone https://github.com/yourusername/APEX-MD-V2.git
cd APEX-MD-V2
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
# Edit config.env file and add your settings
nano config.env
```

4. Get Session ID:
```bash
# Run this to get your session code
npm start
# Scan the QR code with your WhatsApp
```

5. Start the bot:
```bash
npm start
```

### Method 2: Heroku Deployment

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

1. Click the button above
2. Fill in the required environment variables
3. Deploy!

### Method 3: Railway Deployment

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app)

## ⚙️ Configuration

Edit `config.env` file:

```env
SESSION_ID=        # Your session ID (required)
MONGODB=          # MongoDB connection URL
PREFIX=.          # Command prefix
MODE=public       # Bot mode (public/private/inbox/groups)
OWNER_NUMBER=     # Your WhatsApp number
SUDO=             # Additional admin numbers (comma separated)
```

## 📝 Available Commands

### Main Commands
- `.menu` - Show all commands
- `.ping` - Check bot speed
- `.alive` - Check if bot is online
- `.owner` - Get owner contact

### Owner Commands
- `.restart` - Restart the bot

## 🔧 Adding New Commands

Create a new file in `plugins/` folder:

```javascript
const { cmd } = require('../lib/commands');

cmd({
    pattern: "test",
    desc: "Test command",
    category: "misc",
    react: "✅",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    await reply("Test successful! ✅");
});
```

## 📁 Project Structure

```
APEX-MD-V2/
├── index.js          # Main bot file
├── config.js         # Configuration
├── package.json      # Dependencies
├── config.env        # Environment variables
├── lib/              # Core libraries
│   ├── commands.js   # Command handler
│   ├── functions.js  # Utility functions
│   └── database.js   # MongoDB functions
├── plugins/          # Command plugins
│   ├── ping.js
│   ├── alive.js
│   ├── menu.js
│   └── owner.js
└── auth_info/        # Session data (auto-generated)
```

## 🛠️ Troubleshooting

### Bot not responding to commands?
- Check if PREFIX is correct in config.env
- Make sure plugins are loaded (check terminal)
- Verify MODE setting matches your usage

### Connection issues?
- Delete `auth_info` folder and scan QR again
- Check internet connection
- Verify WhatsApp number is not banned

### Database errors?
- Check MongoDB connection URL
- Verify database credentials
- Ensure MongoDB cluster is accessible

## 📞 Support

- WhatsApp: +94701391585
- GitHub Issues: [Create Issue](https://github.com/yourusername/APEX-MD-V2/issues)

## 👨‍💻 Developer

**Shehan Vimukthi**
- WhatsApp: +94701391585
- GitHub: [@pancha2000](https://github.com/pancha2000)

## 📜 License

This project is licensed under the MIT License.

## ⚠️ Disclaimer

This bot is for educational purposes only. Use at your own risk. We are not responsible for any misuse of this bot.

## 🙏 Credits

- [Baileys](https://github.com/WhiskeySockets/Baileys) - WhatsApp Web API
- All contributors and users

---

Made with ❤️ by Shehan Vimukthi
