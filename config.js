const fs = require('fs');
const path = require('path');

// .env file එක තිබ්බොත් load කරන්න
if (fs.existsSync('./config.env')) {
    require('dotenv').config({ path: './config.env' });
}

// Configuration
const config = {
    // ==================== BOT INFO ====================
    SESSION_ID: process.env.SESSION_ID || "",
    BOT_NAME: process.env.BOT_NAME || "APEX-MD",
    
    // ==================== PAIRING ====================
    USE_PAIRING_CODE: process.env.USE_PAIRING_CODE || "false",
    PHONE_NUMBER: process.env.PHONE_NUMBER || "",
    
    // ==================== DATABASE ====================
    MONGODB: process.env.MONGODB || "",
    
    // ==================== BOT SETTINGS ====================
    PREFIX: process.env.PREFIX || ".",
    MODE: process.env.MODE || "public", // public, private, inbox, groups
    AUTO_READ: process.env.AUTO_READ || "true",
    AUTO_STATUS_READ: process.env.AUTO_STATUS_READ || "false",
    AUTO_TYPING: process.env.AUTO_TYPING || "false",
    AUTO_RECORDING: process.env.AUTO_RECORDING || "false",
    
    // ==================== OWNER INFO ====================
    OWNER_NAME: process.env.OWNER_NAME || "Shehan Vimukthi",
    OWNER_NUMBER: process.env.OWNER_NUMBER || "94701391585",
    SUDO: process.env.SUDO || "94771189323", // Multiple: "9471xxx,9472xxx"
    
    // ==================== ALIVE & MENU ====================
    ALIVE_IMG: process.env.ALIVE_IMG || "https://i.imgur.com/VlZ2Y0l.jpeg",
    ALIVE_MSG: process.env.ALIVE_MSG || "✅ *APEX-MD IS ONLINE*",
    
    // ==================== OTHER ====================
    PORT: process.env.PORT || 8000,
    TIME_ZONE: process.env.TIME_ZONE || "Asia/Colombo",
    DEBUG: process.env.DEBUG || "false",
    
    // ==================== API KEYS ====================
    GEMINI_API: process.env.GEMINI_API || "",
    WEATHER_API: process.env.WEATHER_API || "",
};

// Validation
if (!config.SESSION_ID) {
    console.log("⚠️  SESSION_ID නැහැ! කරුණාකර config.env file එකේ SESSION_ID එක add කරන්න.");
}

module.exports = config;
