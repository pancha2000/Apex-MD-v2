const { cmd } = require('../../lib/commands');
const config = require('../../config');
const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const { getRandom } = require('../../lib/functions');

cmd({
    pattern: "song",
    alias: ["play", "yt", "ytmp3"],
    desc: "Download YouTube songs",
    category: "downloads",
    react: "🎵",
    filename: __filename
},
async (conn, mek, m, { reply, text }) => {
    try {
        if (!text) {
            return await reply('❌ කරුණාකර song name එකක් දෙන්න!\n\nExample: .song faded');
        }

        await m.react('🔎');
        
        // Search YouTube
        const search = await yts(text);
        const video = search.videos[0];
        
        if (!video) {
            await m.react('❌');
            return await reply('❌ Song එකක් හොයාගන්න බැරි වුණා!');
        }

        // Check duration (max 10 minutes)
        const duration = video.seconds;
        if (duration > 600) {
            await m.react('❌');
            return await reply('❌ Song එක ලොකු වැඩියි! (Max: 10 minutes)');
        }

        await m.react('⏳');

        // Send info message
        const infoMsg = `
╔═══════════════════════════╗
║   🎵 *SONG DOWNLOADER*    ║
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

        // Download audio
        const stream = ytdl(video.url, {
            filter: 'audioonly',
            quality: 'highestaudio'
        });

        const fileName = getRandom('.mp3');
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

        // Send audio
        await conn.sendMessage(m.from, {
            audio: { url: filePath },
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: video.title,
                    body: `APEX-MD V2 | ${video.timestamp}`,
                    thumbnail: await (await fetch(video.thumbnail)).buffer(),
                    mediaType: 1,
                    mediaUrl: video.url,
                    sourceUrl: video.url
                }
            }
        }, { quoted: mek });

        await m.react('✅');

        // Cleanup
        fs.unlinkSync(filePath);

    } catch (e) {
        await m.react('❌');
        await reply('❌ Error: ' + e.message);
        console.log('Song download error:', e);
    }
});