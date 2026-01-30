const { cmd } = require('../lib/commands');
const config = require('../config');
const { runtime } = require('../lib/functions');

cmd({
    pattern: "alive",
    alias: ["online", "bot"],
    desc: "Check if bot is online",
    category: "main",
    react: "👋",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    try {
        const uptime = runtime(process.uptime());
        
        const aliveMsg = `
╔════════════════════╗
║   ${config.ALIVE_MSG}   ║
╚════════════════════╝

┏━━━━━━━━━━━━━━━━━━
┃ ⏱️ *Uptime:* ${uptime}
┃ 👤 *Owner:* ${config.OWNER_NAME}
┃ 🤖 *Bot:* ${config.BOT_NAME}
┃ 📌 *Prefix:* ${config.PREFIX}
┃ ⚙️ *Mode:* ${config.MODE}
┃ 📦 *Version:* 2.0.0
┗━━━━━━━━━━━━━━━━━━

> *APEX-MD V2* 🚀
`;

        if (config.ALIVE_IMG) {
            await conn.sendMessage(m.from, {
                image: { url: config.ALIVE_IMG },
                caption: aliveMsg
            }, { quoted: mek });
        } else {
            await reply(aliveMsg);
        }
    } catch (e) {
        await reply('❌ Error: ' + e.message);
    }
});
