const { cmd } = require('../lib/commands');
const axios = require('axios');
const fs = require('fs');
const { getRandom } = require('../lib/functions');

cmd({
    pattern: "tiktok",
    alias: ["tt", "ttdl"],
    desc: "Download TikTok videos without watermark",
    category: "downloads",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, { reply, text }) => {
    try {
        if (!text) {
            return await reply('❌ කරුණාකර TikTok link එකක් දෙන්න!\n\nExample: .tiktok https://vm.tiktok.com/xxxxx');
        }

        // Validate TikTok URL
        if (!text.includes('tiktok.com')) {
            return await reply('❌ වලංගු TikTok link එකක් නෙවෙයි!');
        }

        await m.react('⏳');

        // Using TikTok API (you can use multiple APIs as fallback)
        const apis = [
            `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(text)}`,
            `https://www.tikwm.com/api/?url=${encodeURIComponent(text)}`
        ];

        let data = null;
        
        for (let api of apis) {
            try {
                const response = await axios.get(api);
                if (response.data) {
                    data = response.data;
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!data) {
            await m.react('❌');
            return await reply('❌ TikTok video එක download කරන්න බැරි වුණා! Link එක check කරන්න.');
        }

        // Extract video info
        const videoUrl = data.video?.noWatermark || data.data?.play || data.video;
        const title = data.title || data.data?.title || 'TikTok Video';
        const author = data.author?.nickname || data.data?.author?.nickname || 'Unknown';

        if (!videoUrl) {
            await m.react('❌');
            return await reply('❌ Video URL එක හොයාගන්න බැරි වුණා!');
        }

        // Send info
        const infoMsg = `
╔═══════════════════════════╗
║  🎬 *TIKTOK DOWNLOADER*   ║
╚═══════════════════════════╝

👤 *Author:* ${author}
📌 *Title:* ${title}

⏳ *Downloading...*
`;

        await reply(infoMsg);

        // Download video
        const videoBuffer = await axios.get(videoUrl, { responseType: 'arraybuffer' });
        const fileName = getRandom('.mp4');
        const filePath = `./temp/${fileName}`;

        if (!fs.existsSync('./temp')) {
            fs.mkdirSync('./temp');
        }

        fs.writeFileSync(filePath, Buffer.from(videoBuffer.data));

        // Send video
        await conn.sendMessage(m.from, {
            video: { url: filePath },
            caption: `🎬 *TikTok Video*\n\n👤 *Author:* ${author}\n📌 *Title:* ${title}\n\n> APEX-MD V2 | No Watermark`,
            mimetype: 'video/mp4'
        }, { quoted: mek });

        await m.react('✅');

        // Cleanup
        fs.unlinkSync(filePath);

    } catch (e) {
        await m.react('❌');
        await reply('❌ Error: ' + e.message);
        console.log('TikTok download error:', e);
    }
});