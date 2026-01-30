const mongoose = require('mongoose');
const config = require('../config');

let isConnected = false;

/**
 * MongoDB connect කරන්න
 */
async function connectDB() {
    if (isConnected) {
        console.log('📦 Database already connected');
        return;
    }

    if (!config.MONGODB) {
        console.log('⚠️  MongoDB URL නැහැ config.env එකේ!');
        return;
    }

    try {
        await mongoose.connect(config.MONGODB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        isConnected = true;
        console.log('✅ MongoDB Connected Successfully');
    } catch (error) {
        console.log('❌ MongoDB Connection Failed:', error.message);
        process.exit(1);
    }
}

/**
 * Settings Schema
 */
const settingsSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed }
});

const Settings = mongoose.model('Settings', settingsSchema);

/**
 * Setting එකක් save කරන්න
 */
async function setSetting(key, value) {
    try {
        await Settings.findOneAndUpdate(
            { key },
            { value },
            { upsert: true, new: true }
        );
        return true;
    } catch (e) {
        console.log('Save Setting Error:', e.message);
        return false;
    }
}

/**
 * Setting එකක් ගන්න
 */
async function getSetting(key, defaultValue = null) {
    try {
        const data = await Settings.findOne({ key });
        return data ? data.value : defaultValue;
    } catch (e) {
        console.log('Get Setting Error:', e.message);
        return defaultValue;
    }
}

/**
 * User Schema
 */
const userSchema = new mongoose.Schema({
    jid: { type: String, required: true, unique: true },
    name: String,
    isBanned: { type: Boolean, default: false },
    warnings: { type: Number, default: 0 },
    totalCommands: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

/**
 * Group Schema
 */
const groupSchema = new mongoose.Schema({
    jid: { type: String, required: true, unique: true },
    name: String,
    desc: String,
    antilink: { type: Boolean, default: false },
    antidelete: { type: Boolean, default: false },
    welcome: { type: Boolean, default: false },
    goodbye: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Group = mongoose.model('Group', groupSchema);

module.exports = {
    connectDB,
    Settings,
    setSetting,
    getSetting,
    User,
    Group
};
