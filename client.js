// ====================================
// إعدادات عميل الواتساب
// ====================================

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const messageHandler = require('../handlers/messageHandler');
const { setupReconnect } = require('./reconnect');

let client = null;
let pairingInProgress = false;

function initializeClient() {
    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ]
        }
    });

    // حدث QR code
    client.on('qr', (qr) => {
        if (!pairingInProgress) {
            qrcode.generate(qr, { small: true });
            console.log('📱 امسح QR كود أعلاه');
        }
    });

    // حدث الاستعداد
    client.on('ready', () => {
        console.log('✅ بوت الواتساب جاهز');
        global.whatsappClient = client;
        
        // حفظ معلومات البوت
        const botNumber = client.info.wid.user;
        console.log(`🤖 رقم البوت: ${botNumber}`);
    });

    // حدث فصل الاتصال
    client.on('disconnected', (reason) => {
        console.log(`⚠️ البوت فصل: ${reason}`);
        setupReconnect(client);
    });

    // معالج الرسائل
    client.on('message', async (msg) => {
        await messageHandler(client, msg);
    });

    client.initialize();
    return client;
}

// طلب كود اقتران (Pairing Code)
async function requestPairingCode(phoneNumber) {
    if (!client) return null;
    
    try {
        pairingInProgress = true;
        const code = await client.requestPairingCode(phoneNumber);
        pairingInProgress = false;
        return code;
    } catch (error) {
        pairingInProgress = false;
        console.error('خطأ في طلب كود الاقتران:', error);
        return null;
    }
}

function getClient() {
    return client;
}

module.exports = { initializeClient, getClient, requestPairingCode };