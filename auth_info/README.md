# Auth Info Folder

මෙම folder එක bot එකේ session data store කරන්න භාවිතා වෙනවා.

## මෙතන තියෙන්නේ මොනවද:

Bot එක start වෙලා WhatsApp එකට connect වුණාම මෙතන files හදනවා:
- `creds.json` - Session credentials
- `app-state-sync-*.json` - WhatsApp state data
- වෙනත් session files

## ⚠️ වැදගත්:

1. **මේ folder එක delete කරන්න එපා!** Bot එකේ session නැති වෙයි.
2. **creds.json file එක share කරන්න එපා!** ඒකෙන් කාටහරි ඔබේ WhatsApp access කරන්න පුළුවන්.
3. **Backup:** Bot එක deploy කරපු පස්සේ මේ files වල backup එකක් තබාගන්න.

## GitHub Upload:

මේ folder එක empty එකක් විදියට GitHub එකට upload වෙන්න `.gitkeep` file එක තියනවා.
Bot එක deploy වුණාම session files automatically මෙතන හදනවා.
