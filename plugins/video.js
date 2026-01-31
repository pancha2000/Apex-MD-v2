const { cmd } = require('../lib/commands');
const config = require('../config');
const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const { getRandom } = require('../lib/functions');

cmd({
    pattern: "video",
    alias: ["ytv", "ytvideo", "ytmp4"],
    desc: "Download YouTube videos",
    category: "downloads",
    react: "🎥",
    filename: __filename
},
async (conn, mek, m, { reply, text, args }) => {
    try {
        if (!text) {
            return await reply('❌ කරුණාකර video name එකක් දෙන්න!\n\nExample: .video faded');
        }

        await m.react('🔎');
        
        // Search YouTube
        const search = await yts(text);
        const video = search.videos[0];
        
        if (!video) {
            await m.react('❌');
            return await reply('❌ Video එකක් හොයාගන්න බැරි වුණා!');
        }

        // Check duration (max 10 minutes)
        const duration = video.seconds;
        if (duration > 600) {
            await m.react('❌');
            return await reply('❌ Video එක ලොකු වැඩියි! (Max: 10 minutes)');
        }

        await m.react('⏳');

        // Send info message
        const infoMsg = `
╔═══════════════════════════╗
║   🎥 *VIDEO DOWNLOADER*   ║
╚═══════════════════════════╝

📌 *Title:* ${video.title}
⏱️ *Duration:* ${video.timestamp}
👁️ *Views:* ${video.views.toLocaleString()}
📅 *Uploaded:* ${video.ago}
🔗 *URL:* ${video.url}

⏳ *Downloading...*
`;

        await conn.sendMessage(m.from, {
            image: { url: video.thumbnail },
            caption: infoMsg
        }, { quoted: mek });

        // Download video (360p for smaller size)
        const stream = ytdl(video.url, {
            filter: format => format.container === 'mp4' && format.hasVideo && format.hasAudio,
            quality: 'lowest'
        });

        const fileName = getRandom('.mp4');
        const filePath = `./temp/${fileName}`;

        // Ensure temp directory exists
        if (!fs.existsSync('./temp')) {
            fs.mkdirSync('./temp');
        }

        const file = fs.createWriteStream(filePath);
        stream.pipe(file);

        await new Promise((resolve, reject) => {
            file.on('finish', resolve);
            file.on('error', reject);
        });

        // Check file size (max 100MB)
        const stats = fs.statSync(filePath);
        const fileSizeMB = stats.size / (1024 * 1024);
        
        if (fileSizeMB > 100) {
            fs.unlinkSync(filePath);
            await m.react('❌');
            return await reply('❌ Video එක ලොකු වැඩියි! (Max: 100MB)');
        }

        // Send video
        await conn.sendMessage(m.from, {
            video: { url: filePath },
            caption: `🎥 *${video.title}*\n\n> APEX-MD V2`,
            mimetype: 'video/mp4'
        }, { quoted: mek });

        await m.react('✅');

        // Cleanup
        fs.unlinkSync(filePath);

    } catch (e) {
        await m.react('❌');
        await reply('❌ Error: ' + e.message);
        console.log('Video download error:', e);
    }
});