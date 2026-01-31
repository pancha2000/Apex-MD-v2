const { cmd } = require('../lib/commands');
const config = require('../config');
const { banUser, unbanUser, getUser } = require('../lib/database');
const { getCommandStats } = require('../lib/database');

// Block user
cmd({
    pattern: "block",
    desc: "Block a user from using bot",
    category: "owner",
    react: "🚫",
    isOwner: true,
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    try {
        if (!m.quoted && !m.mentionedJid?.length) {
            return await reply('❌ Block කරන්න ඕනේ කෙනාව mention කරන්න හෝ reply කරන්න!');
        }

        const user = m.quoted ? m.quoted.sender : m.mentionedJid[0];

        await conn.updateBlockStatus(user, 'block');
        await reply(`✅ @${user.split('@')[0]} block කරන ලදී!`);
        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        await reply('❌ Error: ' + e.message);
    }
});

// Unblock user
cmd({
    pattern: "unblock",
    desc: "Unblock a user",
    category: "owner",
    react: "✅",
    isOwner: true,
    filename: __filename
},
async (conn, mek, m, { reply, text }) => {
    try {
        if (!text && !m.mentionedJid?.length) {
            return await reply('❌ කරුණාකර number එකක් හෝ mention එකක් දෙන්න!');
        }

        let user;
        if (m.mentionedJid?.length) {
            user = m.mentionedJid[0];
        } else {
            const number = text.replace(/[^0-9]/g, '');
            user = number + '@s.whatsapp.net';
        }

        await conn.updateBlockStatus(user, 'unblock');
        await reply(`✅ @${user.split('@')[0]} unblock කරන ලදී!`);
        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        await reply('❌ Error: ' + e.message);
    }
});

// Ban user from bot
cmd({
    pattern: "ban",
    desc: "Ban user from using bot (database ban)",
    category: "owner",
    react: "⛔",
    isOwner: true,
    filename: __filename
},
async (conn, mek, m, { reply, args }) => {
    try {
        if (!m.quoted && !m.mentionedJid?.length) {
            return await reply('❌ Ban කරන්න ඕනේ කෙනාව mention කරන්න හෝ reply කරන්න!');
        }

        const user = m.quoted ? m.quoted.sender : m.mentionedJid[0];
        const duration = parseInt(args[1]) || 0; // 0 = permanent

        await banUser(user, duration);

        if (duration > 0) {
            const hours = Math.floor(duration / 3600);
            await reply(`⛔ @${user.split('@')[0]} ${hours} hours සඳහා ban කරන ලදී!`);
        } else {
            await reply(`⛔ @${user.split('@')[0]} permanently ban කරන ලදී!`);
        }

        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        await reply('❌ Error: ' + e.message);
    }
});

// Unban user
cmd({
    pattern: "unban",
    desc: "Unban user",
    category: "owner",
    react: "✅",
    isOwner: true,
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    try {
        if (!m.quoted && !m.mentionedJid?.length) {
            return await reply('❌ Unban කරන්න ඕනේ කෙනාව mention කරන්න හෝ reply කරන්න!');
        }

        const user = m.quoted ? m.quoted.sender : m.mentionedJid[0];

        await unbanUser(user);
        await reply(`✅ @${user.split('@')[0]} unban කරන ලදී!`);
        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        await reply('❌ Error: ' + e.message);
    }
});

// Broadcast message
cmd({
    pattern: "broadcast",
    alias: ["bc"],
    desc: "Send message to all groups",
    category: "owner",
    react: "📢",
    isOwner: true,
    filename: __filename
},
async (conn, mek, m, { reply, text }) => {
    try {
        if (!text) {
            return await reply('❌ කරුණාකර broadcast message එකක් දෙන්න!');
        }

        await m.react('⏳');

        const groups = await conn.groupFetchAllParticipating();
        const groupList = Object.values(groups);

        let sent = 0;
        let failed = 0;

        for (let group of groupList) {
            try {
                await conn.sendMessage(group.id, {
                    text: `📢 *BROADCAST MESSAGE*\n\n${text}\n\n> ${config.BOT_NAME}`
                });
                sent++;
                await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
            } catch (e) {
                failed++;
            }
        }

        await reply(`✅ Broadcast complete!\n\n✅ Sent: ${sent}\n❌ Failed: ${failed}`);
        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        await reply('❌ Error: ' + e.message);
    }
});

// Set bot profile picture
cmd({
    pattern: "setpp",
    desc: "Set bot profile picture",
    category: "owner",
    react: "🖼️",
    isOwner: true,
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    try {
        if (!m.quoted || m.quoted.type !== 'imageMessage') {
            return await reply('❌ කරුණාකර image එකක් reply කරන්න!');
        }

        await m.react('⏳');

        const media = await m.download();
        await conn.updateProfilePicture(conn.user.id, media);

        await reply('✅ Profile picture update කරන ලදී!');
        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        await reply('❌ Error: ' + e.message);
    }
});

// Set bot status
cmd({
    pattern: "setstatus",
    alias: ["setbio"],
    desc: "Set bot status/bio",
    category: "owner",
    react: "📝",
    isOwner: true,
    filename: __filename
},
async (conn, mek, m, { reply, text }) => {
    try {
        if (!text) {
            return await reply('❌ කරුණාකර status එකක් දෙන්න!');
        }

        await conn.updateProfileStatus(text);
        await reply('✅ Status update කරන ලදී!');
        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        await reply('❌ Error: ' + e.message);
    }
});

// Join group with invite link
cmd({
    pattern: "join",
    desc: "Join group using invite link",
    category: "owner",
    react: "🔗",
    isOwner: true,
    filename: __filename
},
async (conn, mek, m, { reply, text }) => {
    try {
        if (!text) {
            return await reply('❌ කරුණාකර group invite link එකක් දෙන්න!');
        }

        // Extract code from link
        const code = text.split('/').pop().replace(/[^a-zA-Z0-9]/g, '');

        await m.react('⏳');

        const result = await conn.groupAcceptInvite(code);
        await reply(`✅ Successfully joined group!`);
        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        if (e.message.includes('already')) {
            await reply('❌ දැනටමත් group එකේ ඉන්නවා!');
        } else {
            await reply('❌ Error: ' + e.message);
        }
    }
});

// Leave group
cmd({
    pattern: "leave",
    desc: "Leave current group",
    category: "owner",
    react: "👋",
    isOwner: true,
    isGroup: true,
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    try {
        await reply('👋 Goodbye! Bot leaving...');
        await conn.groupLeave(m.from);

    } catch (e) {
        await reply('❌ Error: ' + e.message);
    }
});

// Get bot statistics
cmd({
    pattern: "botstats",
    alias: ["stats", "statistics"],
    desc: "Get bot statistics",
    category: "owner",
    react: "📊",
    isOwner: true,
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    try {
        await m.react('⏳');

        const groups = await conn.groupFetchAllParticipating();
        const groupCount = Object.keys(groups).length;

        const commandStats = await getCommandStats();
        const topCommands = commandStats.slice(0, 5).map((cmd, i) => 
            `${i + 1}. ${cmd._id}: ${cmd.count} times`
        ).join('\n');

        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);

        const statsMsg = `
╔═══════════════════════════╗
║    📊 *BOT STATISTICS*    ║
╚═══════════════════════════╝

👥 *Groups:* ${groupCount}
⏱️ *Uptime:* ${days}d ${hours}h ${minutes}m
🤖 *Bot:* ${config.BOT_NAME}
📦 *Version:* ${config.VERSION}

🔝 *Top Commands:*
${topCommands || 'No data'}

💾 *Memory Usage:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
⚙️ *Node Version:* ${process.version}

> *APEX-MD V2 Enhanced*
`;

        await reply(statsMsg);
        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        await reply('❌ Error: ' + e.message);
    }
});

// Execute code (DANGEROUS - owner only)
cmd({
    pattern: "eval",
    desc: "Execute JavaScript code",
    category: "owner",
    react: "⚠️",
    isOwner: true,
    filename: __filename
},
async (conn, mek, m, { reply, text }) => {
    try {
        if (!text) {
            return await reply('❌ කරුණාකර code එකක් දෙන්න!');
        }

        await m.react('⏳');

        let result = await eval(text);
        
        if (typeof result !== 'string') {
            result = require('util').inspect(result);
        }

        await reply(`✅ *Eval Result:*\n\`\`\`${result}\`\`\``);
        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        await reply(`❌ *Eval Error:*\n\`\`\`${e.message}\`\`\``);
    }
});