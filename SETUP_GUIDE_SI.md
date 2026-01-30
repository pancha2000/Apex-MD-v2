# 🚀 APEX-MD V2 - ඉක්මන් Setup මාර්ගෝපදේශය

## 📥 Step 1: Download & Extract

1. APEX-MD-V2.zip file එක download කරන්න
2. Extract කරන්න

## 🔧 Step 2: Install කරන්න

Terminal එක open කරලා:

```bash
cd APEX-MD-V2
npm install
```

## ⚙️ Step 3: Configuration

`config.env` file එක edit කරන්න:

```env
SESSION_ID=          # මෙතන ඔබේ session ID එක paste කරන්න
MONGODB=             # ඔබේ MongoDB URL එක මෙතන
OWNER_NUMBER=94701391585  # ඔබේ WhatsApp number එක
PREFIX=.             # Command prefix (., !, # වගේ)
MODE=public          # public, private, inbox, groups
```

### Session ID එක ගන්නේ කොහොමද?

#### Method 1: QR Code Scan (Recommended)
```bash
npm start
```
Terminal එකේ QR code එකක් පෙන්නන්න ඇති. ඒක ඔබේ WhatsApp එකෙන් scan කරන්න:

1. WhatsApp > Settings > Linked Devices > Link a Device
2. QR එක scan කරන්න
3. Bot එක connect වෙයි!

#### Method 2: Pairing Code
config.env එකේ add කරන්න:
```env
USE_PAIRING_CODE=true
PHONE_NUMBER=94701391585  # ඔබේ number එක
```

## 🚀 Step 4: Start Bot

```bash
npm start
```

Bot එක start වෙලා තියෙනවද කියලා test කරන්න:
- WhatsApp එකෙන් bot number එකට message කරන්න: `.ping`
- Reply එකක් ආවොත් bot එක වැඩ කරනවා! ✅

## 📝 Available Commands

### මූලික Commands:
- `.menu` - සියලු commands බලන්න
- `.ping` - Bot speed test කරන්න
- `.alive` - Bot online ද කියලා බලන්න
- `.owner` - Owner contact ගන්න
- `.system` - System info බලන්න

### Conversion Commands:
- `.sticker` - Image/video එකක් sticker කරන්න (reply to image)

### Owner Commands:
- `.restart` - Bot restart කරන්න (owner විතරයි)

## 🔍 Troubleshooting

### Bot respond නොවෙන්නේ නම්:
1. Prefix එක හරිද බලන්න (default: `.`)
2. Mode එක `public` ද බලන්න
3. Bot number එක ban වෙලා නැද්ද බලන්න

### Connection issues නම්:
1. `auth_info` folder එක delete කරලා restart කරන්න
2. Session ID එක නැවත ගන්න
3. Internet connection එක check කරන්න

### Commands වැඩ නොකරන්නේ නම්:
1. Terminal එකේ errors තියෙනවද බලන්න
2. `npm install` නැවත run කරන්න
3. Node.js version 18+ තියෙනවද බලන්න

## 🆕 නව Commands Add කරන්නේ කොහොමද?

`plugins/` folder එකේ නව file එකක් හදන්න:

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

Save කරලා bot එක restart කරන්න!

## 💡 Tips:

1. **Session backup කරන්න**: `auth_info` folder එක backup කරන්න
2. **MongoDB free එකක් use කරන්න**: MongoDB Atlas free tier එකෙන් ඇති
3. **Logs බලන්න**: Terminal එකේ logs බලලා issues හොයාගන්න පුළුවන්
4. **Mode වෙනස් කරන්න**: 
   - `public` - කවුරුත් use කරන්න පුළුවන්
   - `private` - Owner විතරක් use කරන්න පුළුවන්
   - `inbox` - Inbox එකේ විතරක් වැඩ කරන්නේ
   - `groups` - Groups වල විතරක් වැඩ කරන්නේ

## 📞 Support අවශ්‍යද?

WhatsApp: +94701391585
GitHub: @pancha2000

---

🎉 **සාර්ථකයි!** ඔබේ bot එක දැන් ready! Commands try කරන්න!

Made with ❤️ by Shehan Vimukthi
