# 🚀 KOYEB එකේ Deploy කරන විදිය

## Step 1: Session ID එක Mega.nz එකට Upload කරන්න

### Option A: QR Code Scan කරලා Session ගන්න

1. පළමුව locally bot එක run කරන්න (ඔබේ computer එකේ):
```bash
cd APEX-MD-V2
npm install
npm start
```

2. QR code එක scan කරන්න WhatsApp එකෙන්

3. `auth_info` folder එකේ `creds.json` file එක හදනවා

4. `creds.json` file එක Mega.nz එකට upload කරන්න:
   - https://mega.nz වෙත යන්න
   - Account එකක් හදාගන්න (free)
   - `creds.json` file එක upload කරන්න
   - Upload කරපු file එකට right-click > "Get link"
   - Link එක copy කරන්න
   - Link එකේ `/file/` ට පස්සේ තියන **code එක විතරක්** copy කරන්න
   
   **Example:**
   - Full link: `https://mega.nz/file/AB1234cd#xyz789abc`
   - ඔබ copy කරන්න ඕන code එක: `AB1234cd#xyz789abc`
   
   ⚡ **Tip:** Code එක විතරක් copy කරන්න! Link එක සම්පූර්ණයෙන් copy කරන්න එපා!

### Option B: Session ID එක දැනටමත් තියෙනවනම්

කලින් bot එකක session Mega link එකක් තියෙනවනම්, එය use කරන්න පුළුවන්.

## Step 2: Koyeb Account එකක් හදාගන්න

1. https://www.koyeb.com වෙත යන්න
2. Sign up කරන්න (GitHub account එකෙන් sign up කරන්න පහසුයි)
3. Free tier එක තියෙන නිසා ඔබට free එකක් හදාගන්න පුළුවන්

## Step 3: Bot එක Deploy කරන්න

### GitHub Repository එකක් හදාගන්න

1. GitHub එකේ new repository එකක් හදන්න
2. APEX-MD-V2 folder එක ඔබේ repository එකට upload කරන්න

### Koyeb එකේ Deploy කරන්න

1. Koyeb dashboard එකට යන්න
2. "Create Service" click කරන්න
3. "GitHub" select කරන්න
4. ඔබේ APEX-MD-V2 repository එක select කරන්න
5. Environment Variables add කරන්න:

```
SESSION_ID = AB1234cd#xyz789abc
MONGODB = mongodb+srv://realpancha:2006.Shehan@cluster0.jh6kzmp.mongodb.net/APEX_V4?retryWrites=true&w=majority
OWNER_NUMBER = 94701391585
PREFIX = .
MODE = public
BOT_NAME = APEX-MD
SUDO = 94701391585
AUTO_READ = true
TIME_ZONE = Asia/Colombo
```

**වැදගත්:**
- `SESSION_ID` එකට Mega link එකේ `/file/` ට **පස්සේ තියන code එක විතරක්** paste කරන්න
- Full link එක paste කරන්න එපා - code එක විතරක්!
- Example: `AB1234cd#xyz789abc` (මෙහෙම තියන එකක්)

6. "Deploy" click කරන්න

## Step 4: Bot එක Start වෙනවා!

Koyeb එක automatically:
1. Code එක download කරයි
2. Dependencies install කරයි
3. Session එක Mega එකෙන් download කරයි
4. Bot එක start කරයි

Logs බලන්න bot එක connect වෙලාද කියලා:
- Koyeb dashboard එකේ "Logs" tab එකට යන්න
- `✅ APEX-MD V2 Connected Successfully` කියන message එක තියෙනවද බලන්න

## 🎯 SESSION_ID Format Examples:

### ✅ Recommended (පහසුම!):
```
AB1234cd#xyz789abc
```
Mega link එකේ `/file/` ට පස්සේ තියන code එක විතරක්!

### ✅ Also works (but not needed):
```
https://mega.nz/file/AB1234cd#xyz789abc
```
Full link එක (වැඩ කරයි, නමුත් code එක විතරක් දැම්මොත් වඩා පහසුයි)

### ✅ With any prefix (auto removes):
```
APEX~AB1234cd#xyz789abc
apex-md~AB1234cd#xyz789abc
```
Prefix තිබ්බත් bot එක auto remove කරයි

---

💡 **Best Practice:** Code එක විතරක් use කරන්න! (`AB1234cd#xyz789abc`)

## ⚠️ Common Issues:

### 1. "Mega Session Download Failed"
- Mega link එක public ද කියලා check කරන්න
- Link එක expire වෙලා නැද්ද බලන්න
- Mega.nz එකෙන් file එක delete කරලා නැද්ද බලන්න

### 2. "Session Invalid"
- නැවත session එකක් generate කරන්න
- Fresh `creds.json` file එකක් upload කරන්න Mega එකට
- SESSION_ID එක update කරන්න Koyeb එකේ

### 3. Bot connect නොවෙනවා
- Logs බලන්න errors නැද්ද කියලා
- Environment variables හරිද කියලා check කරන්න
- Repository එක හරියට upload වෙලාද බලන්න

## 💡 Tips:

1. **Session Backup**: `creds.json` file එකේ backup එකක් තබාගන්න
2. **Mega Account**: Free Mega account එකක් use කරන්න (50GB free)
3. **Multiple Bots**: එකම Koyeb account එකේ multiple bots deploy කරන්න පුළුවන්
4. **Auto Deploy**: GitHub repository එකට push කරපු හැම වෙලාවේම Koyeb එක auto deploy කරයි

## 🔄 Updating Bot:

1. GitHub repository එකේ files update කරන්න
2. Commit & Push කරන්න
3. Koyeb automatically redeploy කරයි!

---

✅ **Done!** ඔබේ bot එක දැන් 24/7 running!

📱 Test කරන්න: WhatsApp එකෙන් `.ping` කියලා send කරන්න!
