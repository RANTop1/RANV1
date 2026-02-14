// ====================================
// بوت واتساب - الملف الرئيسي
// ====================================

require('dotenv').config();
const { initializeClient } = require('./core/client');
const { startTelegramBot } = require('./core/telegram');
const fs = require('fs');

// إنشاء المجلدات المطلوبة
if (!fs.existsSync('./sessions')) fs.mkdirSync('./sessions');
if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

// تحميل قاعدة البيانات
global.db = {
    users: {},
    groups: {},
    protection: {},
    installed: {},
    settings: {
        sponsorName: process.env.SPONSOR_NAME || 'ريـان',
        sponsorTag: process.env.SPONSOR_TAG || '★'
    },
    ranks: {
        owner: [],
        superAdmin: [],
        admin: [],
        vip: []
    }
};

// تشغيل بوت التليجرام
startTelegramBot();

// تشغيل بوت الواتساب
initializeClient();

console.log('🚀 البوت شغال - يلا بينا');