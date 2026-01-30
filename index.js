/**
 * ╔═══════════════════════════════════════════╗
 * ║        APEX-MD V2 - WhatsApp Bot          ║
 * ║     Created by: Shehan Vimukthi           ║
 * ╚═══════════════════════════════════════════╝
 */

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeInMemoryStore,
    Browsers,
    delay
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const fs = require('fs');
const path = require('path');
const express = require('express');
const qrcode = require('qrcode-terminal');
const { File } = require('megajs');

const config = require('./config');
const { connectDB } = require('./lib/database');
const { handler } = require('./lib/commands');
const { serialize } = require('./lib/functions');

// Express server
const app = express();
const PORT = config.PORT || 8000;

// Store
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

// Auth folder
const authFolder = path.join(__dirname, 'auth_info');
if (!fs.existsSync(authFolder)) {
    fs.mkdirSync(authFolder, { recursive: true });
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

    const files = fs.readdirSync(pluginFolder);
    let loaded = 0;

    files.forEach(file => {
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
    console.log('║        🚀 APEX-MD V2 Starting...         ║');
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
            console.log('║    ✅ APEX-MD V2 Connected Successfully   ║');
            console.log('╚═══════════════════════════════════════════╝');
            console.log('');
            console.log(`📱 Bot Number: ${conn.user.id.split(':')[0]}`);
            console.log(`📦 Total Commands: ${handler.getCommands().length}`);
            console.log(`🔧 Prefix: ${config.PREFIX}`);
            console.log(`⚙️  Mode: ${config.MODE}`);
            console.log('');
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

            // Check if it's a command
            const body = m.body || '';
            const prefix = config.PREFIX;
            
            if (!body.startsWith(prefix)) return;

            // Get command name
            const args = body.slice(prefix.length).trim().split(/ +/);
            const cmdName = args[0].toLowerCase();
            const text = args.slice(1).join(' ');

            // Find command
            const cmd = handler.findCommand(cmdName);
            if (!cmd) return;

            // Check permissions
            const isOwner = config.SUDO.split(',').includes(m.sender.split('@')[0]);
            
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
            <head><title>APEX-MD V2</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
                <h1>✅ APEX-MD V2 is Running</h1>
                <p>Bot Status: <strong style="color: green;">Active</strong></p>
                <p>Version: 2.0.0</p>
            </body>
        </html>
    `);
});

// Start server
app.listen(PORT, () => {
    console.log(`🌐 Web Server: http://localhost:${PORT}`);
    startBot();
});

// Error handlers
process.on('uncaughtException', (err) => {
    console.log('❌ Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (err) => {
    console.log('❌ Unhandled Rejection:', err.message);
});
