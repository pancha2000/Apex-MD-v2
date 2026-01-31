/**
 * ╔═══════════════════════════════════════════╗
 * ║   APEX-MD V2 ENHANCED - WhatsApp Bot      ║
 * ║     Created by: Shehan Vimukthi           ║
 * ║     Enhanced with AI Features             ║
 * ╚═══════════════════════════════════════════╝
 */

const Baileys = require('@whiskeysockets/baileys');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    Browsers,
    delay
} = Baileys;

// makeInMemoryStore may not exist in all versions
const makeInMemoryStore = Baileys.makeInMemoryStore || null;

const pino = require('pino');
const fs = require('fs');
const path = require('path');
const express = require('express');
const qrcode = require('qrcode-terminal');
const { File } = require('megajs');

const config = require('./config');
const { connectDB, getGroup, updateGroup, getUser, addWarning, getWarnings, clearWarnings } = require('./lib/database');
const { handler } = require('./lib/commands');
const { serialize } = require('./lib/functions');

// Express server
const app = express();
const PORT = config.PORT || 8000;

// Store (optional - may not be available in all Baileys versions)
let store = null;
if (makeInMemoryStore && typeof makeInMemoryStore === 'function') {
    try {
        store = makeInMemoryStore({ 
            logger: pino().child({ level: 'silent', stream: 'store' }) 
        });
        console.log('✅ Message store enabled');
    } catch (e) {
        console.log('⚠️  Store initialization failed:', e.message);
    }
} else {
    console.log('⚠️  makeInMemoryStore not available in this Baileys version');
}

// Auth folder
const authFolder = path.join(__dirname, 'auth_info');
if (!fs.existsSync(authFolder)) {
    fs.mkdirSync(authFolder, { recursive: true });
}

// Temp folder for downloads
const tempFolder = path.join(__dirname, 'temp');
if (!fs.existsSync(tempFolder)) {
    fs.mkdirSync(tempFolder, { recursive: true });
}

/**
 * Load all plugins
 */
function loadPlugins() {
    const pluginFolder = path.join(__dirname, 'plugins');
    
    if (!fs.existsSync(pluginFolder)) {
        console.log('⚠️  Plugins folder නැහැ!');
        return;
    }

    let loaded = 0;

    // Load plugins from subdirectories
    const categories = ['downloads', 'ai', 'group', 'owner', 'utils', 'fun', 'media'];
    
    categories.forEach(category => {
        const categoryPath = path.join(pluginFolder, category);
        if (fs.existsSync(categoryPath)) {
            const files = fs.readdirSync(categoryPath);
            files.forEach(file => {
                if (file.endsWith('.js')) {
                    try {
                        require(path.join(categoryPath, file));
                        loaded++;
                    } catch (e) {
                        console.log(`❌ Plugin Load Error [${category}/${file}]:`, e.message);
                    }
                }
            });
        }
    });

    // Load root level plugins
    const rootFiles = fs.readdirSync(pluginFolder);
    rootFiles.forEach(file => {
        if (file.endsWith('.js')) {
            try {
                require(path.join(pluginFolder, file));
                loaded++;
            } catch (e) {
                console.log(`❌ Plugin Load Error [${file}]:`, e.message);
            }
        }
    });

    console.log(`✅ Loaded ${loaded} plugins successfully`);
}

/**
 * Download session from Mega.nz
 */
async function downloadSession() {
    if (!config.SESSION_ID) {
        console.log('⚠️  SESSION_ID නැහැ config.env එකේ!');
        return false;
    }

    // Check if creds.json already exists
    if (fs.existsSync(path.join(authFolder, 'creds.json'))) {
        console.log('✅ Session දැනටමත් තියනවා');
        return true;
    }

    console.log('📥 Downloading session from Mega.nz...');

    try {
        let sessionUrl = config.SESSION_ID.trim();

        // Remove any "APEX~" or similar prefixes
        sessionUrl = sessionUrl.replace(/^APEX~/i, '');
        sessionUrl = sessionUrl.replace(/^apex-md~/i, '');
        sessionUrl = sessionUrl.replace(/^apex~/i, '');

        // If it's not a full URL, make it one
        if (!sessionUrl.includes('mega.nz')) {
            sessionUrl = `https://mega.nz/file/${sessionUrl}`;
        }

        console.log('🔗 Mega File Code:', sessionUrl.split('/file/')[1] || sessionUrl);

        // Download from Mega
        const file = File.fromURL(sessionUrl);
        await file.loadAttributes();
        
        const data = await new Promise((resolve, reject) => {
            file.download((err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });

        // Save to auth folder
        if (!fs.existsSync(authFolder)) {
            fs.mkdirSync(authFolder, { recursive: true });
        }

        fs.writeFileSync(path.join(authFolder, 'creds.json'), data);
        console.log('✅ Session download කරන එක සාර්ථකයි!');
        return true;

    } catch (error) {
        console.log('❌ Mega Session Download Failed:', error.message);
        console.log('💡 Tip: Mega link එක හරිද බලන්න');
        return false;
    }
}

/**
 * Start bot connection
 */
async function startBot() {
    console.log('');
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║    🚀 APEX-MD V2 ENHANCED Starting...   ║');
    console.log('╚═══════════════════════════════════════════╝');
    console.log('');

    // Download session from Mega if needed
    if (config.SESSION_ID) {
        await downloadSession();
    }

    // Connect to database
    if (config.MONGODB) {
        await connectDB();
    }

    // Load plugins
    loadPlugins();

    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: config.USE_PAIRING_CODE === 'false',
        browser: Browsers.ubuntu('APEX-MD'),
        auth: state,
        getMessage: async (key) => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id);
                return msg?.message || undefined;
            }
            return { conversation: 'APEX-MD' };
        }
    });

    // Pairing code support
    if (config.USE_PAIRING_CODE === 'true' && !conn.authState.creds.registered) {
        if (!config.PHONE_NUMBER) {
            console.log('⚠️  PHONE_NUMBER නැහැ! config.env එකේ add කරන්න.');
            process.exit(0);
        }

        setTimeout(async () => {
            const code = await conn.requestPairingCode(config.PHONE_NUMBER);
            console.log('');
            console.log('╔═══════════════════════════════════════════╗');
            console.log(`║    Pairing Code: ${code}                ║`);
            console.log('╚═══════════════════════════════════════════╝');
            console.log('');
            console.log('📱 WhatsApp > Settings > Linked Devices > Link a Device');
            console.log('📱 "Link with phone number instead" option එක select කරන්න');
            console.log(`📱 Code එක enter කරන්න: ${code}`);
            console.log('');
        }, 3000);
    }

    // Bind store
    store?.bind(conn.ev);

    // Save credentials
    conn.ev.on('creds.update', saveCreds);

    // Connection update
    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        // QR code
        if (qr) {
            console.log('📱 QR Code:');
            qrcode.generate(qr, { small: true });
        }

        // Connection closed
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            
            console.log('');
            console.log('❌ Connection Closed. Reason:', reason);
            
            // Logged out
            if (reason === DisconnectReason.loggedOut) {
                console.log('⚠️  Bot logged out. ලොග්අවුට් වුණා. Auth folder මකන්න...');
                if (fs.existsSync(authFolder)) {
                    fs.rmSync(authFolder, { recursive: true, force: true });
                }
                process.exit(0);
            }
            // Bad session
            else if (reason === DisconnectReason.badSession) {
                console.log('⚠️  Bad Session. Auth folder මකලා restart කරන්න...');
                if (fs.existsSync(authFolder)) {
                    fs.rmSync(authFolder, { recursive: true, force: true });
                }
            }
            
            // Reconnect
            console.log('🔄 Reconnecting in 5 seconds...');
            setTimeout(() => startBot(), 5000);
        }
        // Connection open
        else if (connection === 'open') {
            console.log('');
            console.log('╔═══════════════════════════════════════════╗');
            console.log('║  ✅ APEX-MD V2 ENHANCED Connected!       ║');
            console.log('╚═══════════════════════════════════════════╝');
            console.log('');
            console.log(`📱 Bot Number: ${conn.user.id.split(':')[0]}`);
            console.log(`📦 Total Commands: ${handler.getCommands().length}`);
            console.log(`🔧 Prefix: ${config.PREFIX}`);
            console.log(`⚙️  Mode: ${config.MODE}`);
            console.log(`🤖 Version: 2.0.0 Enhanced`);
            console.log('');
        }
    });

    // Group participants update (Welcome/Goodbye)
    conn.ev.on('group-participants.update', async (update) => {
        try {
            const { id, participants, action } = update;
            
            // Get group settings from database
            const group = await getGroup(id);
            if (!group) return;

            const groupMetadata = await conn.groupMetadata(id);
            
            for (let participant of participants) {
                // Welcome message
                if (action === 'add' && group.welcome) {
                    let message = group.welcomeMessage || '👋 Welcome @user to @group!';
                    message = message
                        .replace('@user', `@${participant.split('@')[0]}`)
                        .replace('@group', groupMetadata.subject)
                        .replace('@desc', groupMetadata.desc || '');

                    await conn.sendMessage(id, {
                        text: message,
                        mentions: [participant]
                    });
                } 
                // Goodbye message
                else if (action === 'remove' && group.goodbye) {
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

    // Messages handler
    conn.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            if (mek.key && mek.key.remoteJid === 'status@broadcast') return;

            // Serialize message
            const m = await serialize(conn, mek);
            
            // Auto read
            if (config.AUTO_READ === 'true') {
                await conn.readMessages([mek.key]);
            }

            // Get message body
            const body = m.body || '';

            // ============================================
            // ANTILINK PROTECTION
            // ============================================
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
                            
                            return; // Stop processing
                        }
                    }
                }
            }

            // ============================================
            // COMMAND PROCESSING
            // ============================================
            const prefix = config.PREFIX;
            
            if (!body.startsWith(prefix)) return;

            // Get command name
            const args = body.slice(prefix.length).trim().split(/ +/);
            const cmdName = args[0].toLowerCase();
            const text = args.slice(1).join(' ');

            // Find command
            const cmd = handler.findCommand(cmdName);
            if (!cmd) return;

            // Check if user is banned
            const user = await getUser(m.sender);
            if (user?.banned) {
                if (user.banExpiry && user.banExpiry < new Date()) {
                    // Ban expired, unban
                    await updateUser(m.sender, { banned: false, banExpiry: null });
                } else {
                    return await conn.sendMessage(m.from, {
                        text: '❌ ඔබ bot එක use කරන්න ban කරලා තියෙනවා!'
                    }, { quoted: mek });
                }
            }

            // Check permissions
            const isOwner = config.isOwner(m.sender);
            
            // Owner only commands
            if (cmd.isOwner && !isOwner) {
                return await conn.sendMessage(m.from, {
                    text: '❌ මේ command එක owner විතරයි use කරන්න පුළුවන්!'
                }, { quoted: mek });
            }

            // Group only commands
            if (cmd.isGroup && !m.isGroup) {
                return await conn.sendMessage(m.from, {
                    text: '❌ මේ command එක groups වලයි use කරන්න පුළුවන්!'
                }, { quoted: mek });
            }

            // Private only commands
            if (cmd.isPrivate && m.isGroup) {
                return await conn.sendMessage(m.from, {
                    text: '❌ මේ command එක inbox එකේ විතරයි use කරන්න පුළුවන්!'
                }, { quoted: mek });
            }

            // React if configured
            if (cmd.react) {
                await conn.sendMessage(m.from, {
                    react: { text: cmd.react, key: mek.key }
                });
            }

            // Debug log
            if (config.DEBUG === 'true') {
                console.log(`[CMD] ${m.sender.split('@')[0]}: ${body}`);
            }

            // Execute command
            const extra = {
                conn,
                m,
                text,
                args,
                isOwner,
                reply: async (text) => {
                    return await conn.sendMessage(m.from, { text }, { quoted: mek });
                },
                react: async (emoji) => {
                    return await conn.sendMessage(m.from, {
                        react: { text: emoji, key: mek.key }
                    });
                }
            };

            await cmd.function(conn, mek, m, extra);

            // Log command usage to database
            if (config.MONGODB) {
                const { logCommand } = require('./lib/database');
                await logCommand(cmd.pattern, m.sender, m.isGroup ? m.from : null);
            }

        } catch (e) {
            console.log('❌ Message Handler Error:', e.message);
            if (config.DEBUG === 'true') {
                console.log(e);
            }
        }
    });

    return conn;
}

// Express routes
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>APEX-MD V2 ENHANCED</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                        padding: 50px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                    }
                    .container {
                        background: rgba(255,255,255,0.1);
                        padding: 40px;
                        border-radius: 20px;
                        backdrop-filter: blur(10px);
                    }
                    h1 { font-size: 3em; margin-bottom: 20px; }
                    .status { color: #4ade80; font-weight: bold; font-size: 1.5em; }
                    .version { margin-top: 20px; opacity: 0.8; }
                    .features { margin-top: 30px; text-align: left; }
                    .features li { margin: 10px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>✅ APEX-MD V2 ENHANCED</h1>
                    <p class="status">Status: Active & Running</p>
                    <p class="version">Version: 2.0.0 Enhanced Edition</p>
                    
                    <div class="features">
                        <h2>🚀 Features:</h2>
                        <ul>
                            <li>📥 Download System (YouTube, TikTok)</li>
                            <li>🤖 AI Integration (Gemini, ChatGPT)</li>
                            <li>👥 Complete Group Management</li>
                            <li>🛡️ Antilink Protection</li>
                            <li>👋 Welcome/Goodbye Messages</li>
                            <li>👑 Owner Control Panel</li>
                            <li>🛠️ Utility Commands</li>
                            <li>💾 Database Integration</li>
                            <li>📊 44+ Commands Total</li>
                        </ul>
                    </div>
                    
                    <p style="margin-top: 30px;">
                        Created with ❤️ by Shehan Vimukthi<br>
                        Enhanced with AI
                    </p>
                </div>
            </body>
        </html>
    `);
});

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        version: '2.0.0',
        enhanced: true
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🌐 Web Server: http://localhost:${PORT}`);
    startBot();
});

// Error handlers
process.on('uncaughtException', (err) => {
    console.log('❌ Uncaught Exception:', err.message);
    if (config.DEBUG === 'true') {
        console.log(err);
    }
});

process.on('unhandledRejection', (err) => {
    console.log('❌ Unhandled Rejection:', err.message);
    if (config.DEBUG === 'true') {
        console.log(err);
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('');
    console.log('👋 Bot shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('');
    console.log('👋 Bot shutting down gracefully...');
    process.exit(0);
});