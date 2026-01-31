const { cmd } = require('../../lib/commands');
const config = require('../../config');
const { getGroup, updateGroup } = require('../../lib/database');

// Welcome toggle
cmd({
    pattern: "welcome",
    desc: "Enable/Disable welcome messages",
    category: "group",
    react: "👋",
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

        if (action === 'on' || action === 'enable') {
            await updateGroup(m.from, { welcome: true });
            await reply('✅ Welcome messages *ENABLED*');
            await m.react('✅');
        } else if (action === 'off' || action === 'disable') {
            await updateGroup(m.from, { welcome: false });
            await reply('❌ Welcome messages *DISABLED*');
            await m.react('✅');
        } else {
            const group = await getGroup(m.from);
            const status = group?.welcome ? 'ENABLED ✅' : 'DISABLED ❌';
            
            await reply(`
╔═══════════════════════════╗
║  👋 *WELCOME SETTINGS*    ║
╚═══════════════════════════╝

📊 *Status:* ${status}
💬 *Message:* ${group?.welcomeMessage || 'Default'}

*Usage:*
• .welcome on - Enable
• .welcome off - Disable
• .setwelcome <msg> - Set custom message

*Variables:*
• @user - User mention
• @group - Group name
• @desc - Group description
            `);
        }

    } catch (e) {
        await m.react('❌');
        await reply('❌ Error: ' + e.message);
    }
});

// Goodbye toggle
cmd({
    pattern: "goodbye",
    desc: "Enable/Disable goodbye messages",
    category: "group",
    react: "👋",
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

        if (action === 'on' || action === 'enable') {
            await updateGroup(m.from, { goodbye: true });
            await reply('✅ Goodbye messages *ENABLED*');
            await m.react('✅');
        } else if (action === 'off' || action === 'disable') {
            await updateGroup(m.from, { goodbye: false });
            await reply('❌ Goodbye messages *DISABLED*');
            await m.react('✅');
        } else {
            const group = await getGroup(m.from);
            const status = group?.goodbye ? 'ENABLED ✅' : 'DISABLED ❌';
            
            await reply(`
╔═══════════════════════════╗
║  👋 *GOODBYE SETTINGS*    ║
╚═══════════════════════════╝

📊 *Status:* ${status}
💬 *Message:* ${group?.goodbyeMessage || 'Default'}

*Usage:*
• .goodbye on - Enable
• .goodbye off - Disable
• .setgoodbye <msg> - Set custom message

*Variables:*
• @user - User mention
• @group - Group name
            `);
        }

    } catch (e) {
        await m.react('❌');
        await reply('❌ Error: ' + e.message);
    }
});

// Set welcome message
cmd({
    pattern: "setwelcome",
    desc: "Set custom welcome message",
    category: "group",
    react: "✍️",
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

        if (!text) {
            return await reply('❌ කරුණාකර welcome message එකක් දෙන්න!\n\nExample: .setwelcome Welcome @user to @group! 🎉');
        }

        await updateGroup(m.from, { welcomeMessage: text });
        await reply('✅ Welcome message set කරන ලදී!');
        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        await reply('❌ Error: ' + e.message);
    }
});

// Set goodbye message
cmd({
    pattern: "setgoodbye",
    desc: "Set custom goodbye message",
    category: "group",
    react: "✍️",
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

        if (!text) {
            return await reply('❌ කරුණාකර goodbye message එකක් දෙන්න!\n\nExample: .setgoodbye Goodbye @user! We\'ll miss you 👋');
        }

        await updateGroup(m.from, { goodbyeMessage: text });
        await reply('✅ Goodbye message set කරන ලදී!');
        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        await reply('❌ Error: ' + e.message);
    }
});

// මේ code එක index.js එකේ group participants update handler එකට add කරන්න:

/*
// Group participants update (welcome/goodbye)
conn.ev.on('group-participants.update', async (update) => {
    try {
        const { id, participants, action } = update;
        
        const group = await getGroup(id);
        if (!group) return;

        const groupMetadata = await conn.groupMetadata(id);
        
        for (let participant of participants) {
            if (action === 'add' && group.welcome) {
                // Welcome message
                let message = group.welcomeMessage || '👋 Welcome @user to @group!';
                message = message
                    .replace('@user', `@${participant.split('@')[0]}`)
                    .replace('@group', groupMetadata.subject)
                    .replace('@desc', groupMetadata.desc || '');

                await conn.sendMessage(id, {
                    text: message,
                    mentions: [participant]
                });
            } else if (action === 'remove' && group.goodbye) {
                // Goodbye message
                let message = group.goodbyeMessage || '👋 Goodbye @user!';
                message = message
                    .replace('@user', `@${participant.split('@')[0]}`)
                    .replace('@group', groupMetadata.subject);

                await conn.sendMessage(id, {
                    text: message,
                    mentions: [participant]
                });
            }
        }
    } catch (e) {
        console.log('Group participants update error:', e);
    }
});
*/