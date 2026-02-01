const { cmd } = require('../lib/commands');

// Debug command to check group structure
cmd({
    pattern: "debuggroup",
    desc: "Debug group metadata",
    category: "owner",
    react: "🔍",
    isGroup: true,
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    try {
        const groupMetadata = await conn.groupMetadata(m.from);
        const participants = groupMetadata.participants;
        
        // Get bot number
        const botNumber = conn.user.id.split(":")[0] + "@s.whatsapp.net";
        
        console.log("\n=== GROUP DEBUG INFO ===");
        console.log("Bot Number:", botNumber);
        console.log("Your Number:", m.sender);
        console.log("\n=== PARTICIPANTS STRUCTURE ===");
        
        // Show first 3 participants structure
        participants.slice(0, 3).forEach((p, i) => {
            console.log(`\nParticipant ${i + 1}:`, JSON.stringify(p, null, 2));
        });
        
        // Try to find bot
        console.log("\n=== FINDING BOT ===");
        const botParticipant = participants.find(p => {
            console.log(`Checking: ${p.id} === ${botNumber} ?`, p.id === botNumber);
            return p.id === botNumber;
        });
        
        console.log("Bot Participant Found:", botParticipant);
        
        // Try to find user
        console.log("\n=== FINDING USER ===");
        const userParticipant = participants.find(p => {
            console.log(`Checking: ${p.id} === ${m.sender} ?`, p.id === m.sender);
            return p.id === m.sender;
        });
        
        console.log("User Participant Found:", userParticipant);
        
        let debugMsg = `🔍 *Group Debug Info*\n\n`;
        debugMsg += `📱 Bot: ${botNumber}\n`;
        debugMsg += `👤 You: ${m.sender}\n\n`;
        debugMsg += `📊 Total Participants: ${participants.length}\n\n`;
        debugMsg += `🤖 Bot Found: ${botParticipant ? 'Yes' : 'No'}\n`;
        debugMsg += `🔑 Bot Admin: ${botParticipant?.admin || 'undefined'}\n\n`;
        debugMsg += `👤 You Found: ${userParticipant ? 'Yes' : 'No'}\n`;
        debugMsg += `🔑 Your Admin: ${userParticipant?.admin || 'undefined'}\n\n`;
        debugMsg += `📝 Check console/terminal for detailed structure!`;
        
        await reply(debugMsg);
        
    } catch (e) {
        console.error("Debug error:", e);
        await reply('❌ Error: ' + e.message);
    }
});
