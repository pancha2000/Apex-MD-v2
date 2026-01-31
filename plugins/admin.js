const { cmd } = require('../../lib/commands');
const config = require('../../config');
const { updateGroup, addWarning, getWarnings, clearWarnings } = require('../../lib/database');

// Add member
cmd({
    pattern: "add",
    desc: "Add member to group",
    category: "group",
    react: "➕",
    isGroup: true,
    filename: __filename
},
async (conn, mek, m, { reply, text }) => {
    try {
        // Check if user is admin
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

        if (!text) {
            return await reply('❌ කරුණාකර number එකක් දෙන්න!\n\nExample: .add 94xxxxxxxxx');
        }

        let number = text.replace(/[^0-9]/g, '');
        
        if (!number.startsWith('94')) {
            number = '94' + number;
        }

        await m.react('⏳');

        const jid = number + '@s.whatsapp.net';
        await conn.groupParticipantsUpdate(m.from, [jid], 'add');

        await reply(`✅ @${number} group එකට add කරන ලදී!`);
        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        await reply('❌ Error: ' + e.message);
    }
});

// Kick member
cmd({
    pattern: "kick",
    alias: ["remove"],
    desc: "Remove member from group",
    category: "group",
    react: "🚫",
    isGroup: true,
    filename: __filename
},
async (conn, mek, m, { reply }) => {
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

        if (!m.quoted && !m.mentionedJid?.length) {
            return await reply('❌ Remove කරන්න ඕනේ කෙනාව mention කරන්න හෝ reply කරන්න!');
        }

        const user = m.quoted ? m.quoted.sender : m.mentionedJid[0];

        // Check if target is admin
        const targetAdmin = participants.find(p => p.id === user)?.admin;
        if (targetAdmin) {
            return await reply('❌ Admin කෙනෙක් remove කරන්න බැහැ!');
        }

        await m.react('⏳');

        await conn.groupParticipantsUpdate(m.from, [user], 'remove');

        await reply(`✅ @${user.split('@')[0]} group එකෙන් remove කරන ලදී!`);
        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        await reply('❌ Error: ' + e.message);
    }
});

// Promote to admin
cmd({
    pattern: "promote",
    desc: "Promote member to admin",
    category: "group",
    react: "⬆️",
    isGroup: true,
    filename: __filename
},
async (conn, mek, m, { reply }) => {
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

        if (!m.quoted && !m.mentionedJid?.length) {
            return await reply('❌ Promote කරන්න ඕනේ කෙනාව mention කරන්න හෝ reply කරන්න!');
        }

        const user = m.quoted ? m.quoted.sender : m.mentionedJid[0];

        await m.react('⏳');

        await conn.groupParticipantsUpdate(m.from, [user], 'promote');

        await reply(`✅ @${user.split('@')[0]} admin කරන ලදී!`);
        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        await reply('❌ Error: ' + e.message);
    }
});

// Demote from admin
cmd({
    pattern: "demote",
    desc: "Demote admin to member",
    category: "group",
    react: "⬇️",
    isGroup: true,
    filename: __filename
},
async (conn, mek, m, { reply }) => {
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

        if (!m.quoted && !m.mentionedJid?.length) {
            return await reply('❌ Demote කරන්න ඕනේ කෙනාව mention කරන්න හෝ reply කරන්න!');
        }

        const user = m.quoted ? m.quoted.sender : m.mentionedJid[0];

        await m.react('⏳');

        await conn.groupParticipantsUpdate(m.from, [user], 'demote');

        await reply(`✅ @${user.split('@')[0]} admin තනතුරෙන් ඉවත් කරන ලදී!`);
        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        await reply('❌ Error: ' + e.message);
    }
});

// Tag all members
cmd({
    pattern: "tagall",
    alias: ["tag", "all"],
    desc: "Tag all group members",
    category: "group",
    react: "📢",
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

        await m.react('📢');

        const message = text || '📢 *Group Announcement*';
        let tagMsg = `${message}\n\n`;

        for (let participant of participants) {
            tagMsg += `@${participant.id.split('@')[0]}\n`;
        }

        await conn.sendMessage(m.from, {
            text: tagMsg,
            mentions: participants.map(p => p.id)
        }, { quoted: mek });

        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        await reply('❌ Error: ' + e.message);
    }
});

// Hide tag (send message without showing tags)
cmd({
    pattern: "hidetag",
    alias: ["htag"],
    desc: "Send message to all without showing tags",
    category: "group",
    react: "👻",
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
            return await reply('❌ කරුණාකර message එකක් දෙන්න!');
        }

        await conn.sendMessage(m.from, {
            text: text,
            mentions: participants.map(p => p.id)
        }, { quoted: mek });

        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        await reply('❌ Error: ' + e.message);
    }
});

// Mute group
cmd({
    pattern: "mute",
    desc: "Mute group (only admins can send)",
    category: "group",
    react: "🔇",
    isGroup: true,
    filename: __filename
},
async (conn, mek, m, { reply }) => {
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

        await conn.groupSettingUpdate(m.from, 'announcement');
        await updateGroup(m.from, { mute: true });

        await reply('🔇 Group mute කරන ලදී! Admin විතරයි message යවන්න පුළුවන්.');
        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        await reply('❌ Error: ' + e.message);
    }
});

// Unmute group
cmd({
    pattern: "unmute",
    desc: "Unmute group (everyone can send)",
    category: "group",
    react: "🔊",
    isGroup: true,
    filename: __filename
},
async (conn, mek, m, { reply }) => {
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

        await conn.groupSettingUpdate(m.from, 'not_announcement');
        await updateGroup(m.from, { mute: false });

        await reply('🔊 Group unmute කරන ලදී! හැමෝටම message යවන්න පුළුවන්.');
        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        await reply('❌ Error: ' + e.message);
    }
});

// Warning system
cmd({
    pattern: "warn",
    desc: "Warn a user (3 warns = kick)",
    category: "group",
    react: "⚠️",
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

        if (!m.quoted && !m.mentionedJid?.length) {
            return await reply('❌ Warn කරන්න ඕනේ කෙනාව mention කරන්න හෝ reply කරන්න!');
        }

        const user = m.quoted ? m.quoted.sender : m.mentionedJid[0];
        const reason = text || 'No reason provided';

        // Add warning to database
        await addWarning(user, m.from, reason, m.sender);

        // Get total warnings
        const warnings = await getWarnings(user, m.from);
        const warnCount = warnings.length;

        if (warnCount >= 3) {
            // Kick user
            await conn.groupParticipantsUpdate(m.from, [user], 'remove');
            await clearWarnings(user, m.from);
            await reply(`🚫 @${user.split('@')[0]} warnings 3ක් හින්දා kick කරන ලදී!`);
        } else {
            await reply(`⚠️ @${user.split('@')[0]} warned කරන ලදී!\n\n📝 *Reason:* ${reason}\n⚠️ *Warnings:* ${warnCount}/3`);
        }

        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        await reply('❌ Error: ' + e.message);
    }
});

// Reset warnings
cmd({
    pattern: "resetwarn",
    alias: ["unwarn"],
    desc: "Reset user warnings",
    category: "group",
    react: "🔄",
    isGroup: true,
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    try {
        const groupMetadata = await conn.groupMetadata(m.from);
        const participants = groupMetadata.participants;
        const userAdmin = participants.find(p => p.id === m.sender)?.admin;

        if (!userAdmin && !config.isOwner(m.sender)) {
            return await reply('❌ ඔබ admin නෙවෙයි!');
        }

        if (!m.quoted && !m.mentionedJid?.length) {
            return await reply('❌ Reset කරන්න ඕනේ කෙනාව mention කරන්න හෝ reply කරන්න!');
        }

        const user = m.quoted ? m.quoted.sender : m.mentionedJid[0];

        await clearWarnings(user, m.from);
        await reply(`✅ @${user.split('@')[0]} warnings reset කරන ලදී!`);
        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        await reply('❌ Error: ' + e.message);
    }
});