const { cmd } = require('../lib/commands');
const config = require('../config');
const translate = require('translate-google');
const axios = require('axios');
const math = require('mathjs');

// Translate
cmd({
    pattern: "translate",
    alias: ["tr"],
    desc: "Translate text to any language",
    category: "utils",
    react: "🌐",
    filename: __filename
},
async (conn, mek, m, { reply, text, args }) => {
    try {
        if (!text) {
            return await reply(`❌ කරුණාකර translate කරන්න ඕනේ text එක දෙන්න!

*Usage:*
.translate si <text> - Translate to Sinhala
.translate en <text> - Translate to English
.translate ta <text> - Translate to Tamil

*Example:* .translate si Hello world`);
        }

        const lang = args[0].toLowerCase();
        const textToTranslate = args.slice(1).join(' ');

        if (!textToTranslate) {
            return await reply('❌ Translate කරන්න text එකක් දෙන්න!');
        }

        await m.react('⏳');

        const result = await translate(textToTranslate, { to: lang });

        await reply(`
╔═══════════════════════════╗
║    🌐 *TRANSLATION*       ║
╚═══════════════════════════╝

🔤 *Original:* ${textToTranslate}
🌐 *Translated (${lang}):* ${result}

> Powered by Google Translate
`);
        
        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        await reply('❌ Translation failed: ' + e.message);
    }
});

// Weather
cmd({
    pattern: "weather",
    alias: ["temp"],
    desc: "Get weather information",
    category: "utils",
    react: "🌤️",
    filename: __filename
},
async (conn, mek, m, { reply, text }) => {
    try {
        if (!text) {
            return await reply('❌ කරුණාකර city name එකක් දෙන්න!\n\nExample: .weather Colombo');
        }

        await m.react('⏳');

        // Using free weather API
        const response = await axios.get(`https://wttr.in/${encodeURIComponent(text)}?format=j1`);
        const data = response.data;

        const current = data.current_condition[0];
        const location = data.nearest_area[0];

        const weatherMsg = `
╔═══════════════════════════╗
║   🌤️ *WEATHER REPORT*    ║
╚═══════════════════════════╝

📍 *Location:* ${location.areaName[0].value}, ${location.country[0].value}
🌡️ *Temperature:* ${current.temp_C}°C / ${current.temp_F}°F
🌤️ *Condition:* ${current.weatherDesc[0].value}
💨 *Wind:* ${current.windspeedKmph} km/h
💧 *Humidity:* ${current.humidity}%
👁️ *Visibility:* ${current.visibility} km
🌡️ *Feels Like:* ${current.FeelsLikeC}°C

🕐 *Observation Time:* ${current.observation_time}
`;

        await reply(weatherMsg);
        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        await reply('❌ Weather data එක ගන්න බැරි වුණා: ' + e.message);
    }
});

// Calculator
cmd({
    pattern: "calc",
    alias: ["calculator", "math"],
    desc: "Calculate mathematical expressions",
    category: "utils",
    react: "🔢",
    filename: __filename
},
async (conn, mek, m, { reply, text }) => {
    try {
        if (!text) {
            return await reply(`❌ කරුණාකර calculation එකක් දෙන්න!

*Examples:*
.calc 2 + 2
.calc 10 * 5 + 3
.calc sqrt(16)
.calc sin(45)
.calc log(100)`);
        }

        await m.react('⏳');

        const result = math.evaluate(text);

        await reply(`
╔═══════════════════════════╗
║    🔢 *CALCULATOR*        ║
╚═══════════════════════════╝

📝 *Expression:* ${text}
✅ *Result:* ${result}
`);

        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        await reply('❌ Invalid expression: ' + e.message);
    }
});

// QR Code generator
cmd({
    pattern: "qr",
    alias: ["qrcode"],
    desc: "Generate QR code",
    category: "utils",
    react: "📱",
    filename: __filename
},
async (conn, mek, m, { reply, text }) => {
    try {
        if (!text) {
            return await reply('❌ කරුණාකර QR code එකට text එකක් දෙන්න!\n\nExample: .qr https://example.com');
        }

        await m.react('⏳');

        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(text)}`;

        await conn.sendMessage(m.from, {
            image: { url: qrUrl },
            caption: `📱 *QR Code Generated*\n\n📝 *Data:* ${text}\n\n> ${config.BOT_NAME}`
        }, { quoted: mek });

        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        await reply('❌ Error: ' + e.message);
    }
});

// Wikipedia search
cmd({
    pattern: "wiki",
    alias: ["wikipedia"],
    desc: "Search Wikipedia",
    category: "utils",
    react: "📚",
    filename: __filename
},
async (conn, mek, m, { reply, text }) => {
    try {
        if (!text) {
            return await reply('❌ කරුණාකර search query එකක් දෙන්න!\n\nExample: .wiki Sri Lanka');
        }

        await m.react('⏳');

        const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(text)}`);
        const data = response.data;

        if (!data.extract) {
            await m.react('❌');
            return await reply('❌ කිසිම result එකක් හොයාගන්න බැරි වුණා!');
        }

        const wikiMsg = `
╔═══════════════════════════╗
║    📚 *WIKIPEDIA*         ║
╚═══════════════════════════╝

📌 *Title:* ${data.title}

${data.extract}

🔗 *Read more:* ${data.content_urls.desktop.page}
`;

        if (data.thumbnail) {
            await conn.sendMessage(m.from, {
                image: { url: data.thumbnail.source },
                caption: wikiMsg
            }, { quoted: mek });
        } else {
            await reply(wikiMsg);
        }

        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        await reply('❌ Wikipedia search failed: ' + e.message);
    }
});

// Short URL
cmd({
    pattern: "shorturl",
    alias: ["short", "tinyurl"],
    desc: "Shorten a URL",
    category: "utils",
    react: "🔗",
    filename: __filename
},
async (conn, mek, m, { reply, text }) => {
    try {
        if (!text) {
            return await reply('❌ කරුණාකර URL එකක් දෙන්න!\n\nExample: .shorturl https://example.com/very/long/url');
        }

        if (!text.startsWith('http')) {
            return await reply('❌ වලංගු URL එකක් නෙවෙයි! http:// or https:// එක්ක start කරන්න.');
        }

        await m.react('⏳');

        const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(text)}`);
        const shortUrl = response.data;

        await reply(`
╔═══════════════════════════╗
║    🔗 *URL SHORTENER*     ║
╚═══════════════════════════╝

📎 *Original:* ${text}
✂️ *Short URL:* ${shortUrl}
`);

        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        await reply('❌ URL shorten කරන්න බැරි වුණා: ' + e.message);
    }
});

// Define word
cmd({
    pattern: "define",
    alias: ["meaning", "dictionary"],
    desc: "Get word definition",
    category: "utils",
    react: "📖",
    filename: __filename
},
async (conn, mek, m, { reply, text }) => {
    try {
        if (!text) {
            return await reply('❌ කරුණාකර word එකක් දෙන්න!\n\nExample: .define serendipity');
        }

        await m.react('⏳');

        const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${text}`);
        const data = response.data[0];

        const meanings = data.meanings[0];
        const definition = meanings.definitions[0];

        const defMsg = `
╔═══════════════════════════╗
║    📖 *DICTIONARY*        ║
╚═══════════════════════════╝

📌 *Word:* ${data.word}
🔊 *Phonetic:* ${data.phonetic || 'N/A'}
📝 *Part of Speech:* ${meanings.partOfSpeech}

*Definition:*
${definition.definition}

${definition.example ? `*Example:*\n"${definition.example}"` : ''}

${meanings.synonyms?.length ? `*Synonyms:* ${meanings.synonyms.slice(0, 5).join(', ')}` : ''}
`;

        await reply(defMsg);
        await m.react('✅');

    } catch (e) {
        await m.react('❌');
        await reply('❌ Definition හොයාගන්න බැරි වුණා! Word එක හරි spelling එකද බලන්න.');
    }
});