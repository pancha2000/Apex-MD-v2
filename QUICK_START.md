# ⚡ KOYEB QUICK START - 5 Minutes!

## 📋 පියවර 5කින් Bot එක Deploy කරන්න

### ✅ Step 1: Session Code එක ගන්න (2 min)

1. Bot run කරන්න locally:
   ```bash
   npm install
   npm start
   ```

2. QR code scan කරන්න

3. `auth_info/creds.json` file එක Mega.nz එකට upload කරන්න

4. **Code එක විතරක් copy කරන්න:**
   - Link: `https://mega.nz/file/AB1234cd#xyz789abc`
   - Copy කරන්න: `AB1234cd#xyz789abc` ⬅️ මේක විතරක්!

---

### ✅ Step 2: GitHub Repository (1 min)

```bash
git init
git add .
git commit -m "APEX-MD V2"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main
```

---

### ✅ Step 3: Koyeb එකට යන්න (30 sec)

- https://www.koyeb.com
- Sign up with GitHub
- Click "Create Service"

---

### ✅ Step 4: Configure (1 min)

**Repository:** ඔබේ GitHub repo select කරන්න

**Environment Variables:**
```
SESSION_ID=AB1234cd#xyz789abc
OWNER_NUMBER=94701391585
PREFIX=.
MODE=public
```

**Optional (but recommended):**
```
MONGODB=mongodb+srv://realpancha:2006.Shehan@cluster0.jh6kzmp.mongodb.net/APEX_V4
BOT_NAME=APEX-MD
AUTO_READ=true
```

---

### ✅ Step 5: Deploy! (30 sec)

Click **"Deploy"** button!

Bot එක automatically:
- ✅ Install කරයි
- ✅ Session download කරයි
- ✅ Connect කරයි

---

## 🎯 Test කරන්න:

WhatsApp එකෙන් message කරන්න:
```
.ping
```

Reply එකක් ආවොත් ✅ **සාර්ථකයි!**

---

## ⚠️ Common Mistakes:

### ❌ WRONG:
```
SESSION_ID=https://mega.nz/file/AB1234cd#xyz789abc
```
Full link එක දාන එක - වැඩ කරයි, නමුත් අවශ්‍ය නැහැ

### ✅ CORRECT:
```
SESSION_ID=AB1234cd#xyz789abc
```
Code එක විතරක් - පහසුම!

---

## 📱 Need Help?

**Session download fail වෙනවද?**
- Mega link එක public ද බලන්න
- Code එක හරියටම copy කරලා තියෙනවද බලන්න
- # symbol එක තියෙනවද බලන්න

**Bot connect නොවෙනවද?**
- Koyeb logs බලන්න
- Environment variables check කරන්න
- Session නැවත generate කරන්න

---

**📞 Support:** +94701391585

Made with ❤️ for easy deployment!
