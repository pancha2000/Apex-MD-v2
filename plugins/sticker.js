const { cmd } = require('../lib/commands');
const { writeFileSync, unlinkSync } = require('fs');
const { getRandom } = require('../lib/functions');

cmd({
    pattern: "sticker",
    alias: ["s", "stick"],
    desc: "Convert image/video to sticker",
    category: "convert",
    react: "🎨",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    try {
        // Check if message has media
        const quoted = m.quoted || m;
        const mediaType = quoted.type;
        
        if (!['imageMessage', 'videoMessage'].includes(mediaType)) {
            return await reply('❌ Reply to an image or video with .sticker');
        }
        
        await reply('⏳ Creating sticker...');
        
        // Download media
        const buffer = await m.download();
        
        // Send as sticker
        await conn.sendMessage(m.from, {
            sticker: buffer,
            packname: 'APEX-MD',
            author: 'V2'
        }, { quoted: mek });
        
    } catch (e) {
        await reply('❌ Error creating sticker: ' + e.message);
    }
});
