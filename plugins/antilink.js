const { cmd } = require('../lib/commands');
const config = require('../config');
const { getGroup, updateGroup } = require('../lib/database');

// Antilink toggle
cmd({
    pattern: "antilink",
    desc: "Enable/Disable antilink protection",
    category: "group",
    react: "🔗",
    isGroup: true,
    filename: __filename
},
async (conn, mek, m, { reply, text }) => {
    try {
        const groupMetadata = await conn.groupMetadata(m.from);
        const participants = groupMetadata.participants;
        const botAdmin = participants.find(p => p.id === conn.user.id)?.admin;
        const userAdmin = participants.find(p => p.id === m.sender)?.admin;

        if (!botAdmin) {
            return await reply('❌ Bot admin නෙවෙයි!');
        }

        if (!userAdmin && !config.isOwner(m.sender)) {
            return await reply('❌ ඔබ admin නෙවෙයි!');
        }

        const action = text.toLowerCase();

        if (action === 'on' || action === 'enable') {
            await updateGroup(m.from, { antilink: true, antilinkAction: 'kick' });
            await reply('✅ Antilink protection *ENABLED*\n\nLinks යවන කෙනෙක් automatically kick වෙයි!');
            await m.react('✅');
        } else if (action === 'off' || action === 'disable') {
            await updateGroup(m.from, { antilink: false });
            await reply('❌ Antilink protection *DISABLED*');
            await m.react('✅');
        } else {
            const group = await getGroup(m.from);
            const status = group?.antilink ? 'ENABLED ✅' : 'DISABLED ❌';
            
            await reply(`
╔═══════════════════════════╗
║   🔗 *ANTILINK SETTINGS*  ║
╚═══════════════════════════╝

📊 *Status:* ${status}
⚙️ *Action:* ${group?.antilinkAction || 'kick'}

*Usage:*
• .antilink on - Enable
• .antilink off - Disable
• .antilink kick - Set action to kick
• .antilink warn - Set action to warn
• .antilink delete - Only delete message
            `);
        }

    } catch (e) {
        await m.react('❌');
        await reply('❌ Error: ' + e.message);
    }
});

// Antilink action setter
cmd({
    pattern: "antilinkaction",
    desc: "Set antilink action (kick/warn/delete)",
    category: "group",
    react: "⚙️",
    isGroup: true,
    filename: __filename
},
async (conn, mek, m, { reply, text }) => {
    try {
        const groupMetadata = await conn.groupMetadata(m.from);
        const participants = groupMetadata.participants;
        const userAdmin = participants.find(p => p.id === m.sender)?.admin;

        if (!userAdmin && !config.isOwner(m.sender)) {
            return await reply('❌ ඔබ admin නෙවෙයි!');
        }

        const action = text.toLowerCase();

        if (['kick', 'warn', 'delete'].includes(action)) {
            await updateGroup(m.from, { antilinkAction: action });
            await reply(`✅ Antilink action set to: *${action.toUpperCase()}*`);
            await m.react('✅');
        } else {
            await reply('❌ වලංගු action එකක් නෙවෙයි!\n\nOptions: kick, warn, delete');
        }

    } catch (e) {
        await m.react('❌');
        await reply('❌ Error: ' + e.message);
    }
});

// Message handler for antilink (කොල්ල index.js එකට add කරන්න ඕනේ)
// මේක plugin එකක් නෙවෙයි, මේක message handler එකක්
// index.js එකේ message handler එකේ add කරන්න:

/*
// Antilink check
if (m.isGroup) {
    const group = await getGroup(m.from);
    if (group?.antilink) {
        const linkPattern = /(https?:\/\/|www\.)[^\s]+/gi;
        const hasLink = linkPattern.test(body);
        
        if (hasLink) {
            const groupMetadata = await conn.groupMetadata(m.from);
            const participants = groupMetadata.participants;
            const userAdmin = participants.find(p => p.id === m.sender)?.admin;
            const botAdmin = participants.find(p => p.id === conn.user.id)?.admin;
            
            // Ignore if user is admin or owner
            if (!userAdmin && !config.isOwner(m.sender) && botAdmin) {
                // Delete message
                await conn.sendMessage(m.from, { delete: mek.key });
                
                // Take action based on settings
                if (group.antilinkAction === 'kick') {
                    await conn.groupParticipantsUpdate(m.from, [m.sender], 'remove');
                    await conn.sendMessage(m.from, {
                        text: `🚫 @${m.sender.split('@')[0]} link එකක් යැව්වා හින්දා kick කරන ලදී!`,
                        mentions: [m.sender]
                    });
                } else if (group.antilinkAction === 'warn') {
                    await addWarning(m.sender, m.from, 'Sent a link', conn.user.id);
                    const warnings = await getWarnings(m.sender, m.from);
                    
                    if (warnings.length >= 3) {
                        await conn.groupParticipantsUpdate(m.from, [m.sender], 'remove');
                        await clearWarnings(m.sender, m.from);
                        await conn.sendMessage(m.from, {
                            text: `🚫 @${m.sender.split('@')[0]} warnings 3ක් හින්දා kick කරන ලදී!`,
                            mentions: [m.sender]
                        });
                    } else {
                        await conn.sendMessage(m.from, {
                            text: `⚠️ @${m.sender.split('@')[0]} warned! Links යවන්න එපා!\nWarnings: ${warnings.length}/3`,
                            mentions: [m.sender]
                        });
                    }
                } else {
                    // Just delete
                    await conn.sendMessage(m.from, {
                        text: `❌ @${m.sender.split('@')[0]} links යවන්න බැහැ!`,
                        mentions: [m.sender]
                    });
                }
            }
        }
    }
}
*/