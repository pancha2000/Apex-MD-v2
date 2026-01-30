const { cmd, handler } = require('../lib/commands');
const config = require('../config');
const { runtime } = require('../lib/functions');

cmd({
    pattern: "menu",
    alias: ["help", "commands", "list"],
    desc: "Show all commands",
    category: "main",
    react: "📜",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    try {
        const uptime = runtime(process.uptime());
        const categories = handler.getCategories();
        
        let menuText = `
╔═══════════════════════════╗
║    APEX-MD V2 - MENU      ║
╚═══════════════════════════╝

╭─「 *BOT INFO* 」
│ ◦ *Bot:* ${config.BOT_NAME}
│ ◦ *Owner:* ${config.OWNER_NAME}
│ ◦ *Prefix:* ${config.PREFIX}
│ ◦ *Mode:* ${config.MODE}
│ ◦ *Uptime:* ${uptime}
│ ◦ *Commands:* ${handler.getCommands().length}
╰─────────────────

`;

        // Commands by category
        categories.forEach(cat => {
            const cmds = handler.getCommandsByCategory(cat);
            if (cmds.length > 0) {
                menuText += `╭─「 *${cat.toUpperCase()}* 」\n`;
                cmds.forEach(cmd => {
                    menuText += `│ ◦ ${config.PREFIX}${cmd.pattern}\n`;
                });
                menuText += `╰─────────────────\n\n`;
            }
        });

        menuText += `> *APEX-MD V2* © ${new Date().getFullYear()}`;

        await conn.sendMessage(m.from, {
            text: menuText
        }, { quoted: mek });
        
    } catch (e) {
        await reply('❌ Error: ' + e.message);
    }
});
