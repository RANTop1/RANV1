// ====================================
// بوت التليجرام - نظام التنصيب
// ====================================

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const { requestPairingCode } = require('./client');

const token = process.env.TELEGRAM_BOT_TOKEN;
const ownerId = process.env.OWNER_ID;

const INSTALL_DB = './install.json';
let installData = {};

if (fs.existsSync(INSTALL_DB)) {
    installData = JSON.parse(fs.readFileSync(INSTALL_DB, 'utf-8'));
} else {
    installData = { pending: {}, users: {} };
}

function saveDB() {
    fs.writeFileSync(INSTALL_DB, JSON.stringify(installData, null, 2));
}

function startTelegramBot() {
    if (!token) {
        console.log('❌ توكن التليجرام مش موجود');
        return;
    }

    const bot = new TelegramBot(token, { polling: true });
    global.telegramBot = bot;

    // أمر /start
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        
        bot.sendMessage(chatId,
            `🤖 *مرحباً بك في بوت التنصيب*\n\n` +
            `📌 *طريقة تنصيب البوت:*\n\n` +
            `1️⃣ أرسل رقم هاتفك مع مفتاح الدولة:\n` +
            `/install 966501234567\n\n` +
            `2️⃣ سأقوم بإنشاء كود اقتران لك\n` +
            `3️⃣ افتح واتساب > الأجهزة المرتبطة > ربط برمز\n` +
            `4️⃣ أدخل الكود الذي سأرسله لك\n\n` +
            `✅ بعدها سيعمل البوت تلقائياً`,
            { parse_mode: 'Markdown' }
        );
    });

    // أمر /install
    bot.onText(/\/install (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const phone = match[1].replace(/\D/g, '');
        
        if (phone.length < 10) {
            return bot.sendMessage(chatId, '❌ رقم غير صالح. استخدم: /install 966501234567');
        }

        await bot.sendMessage(chatId, `⏳ جاري إنشاء كود الاقتران للرقم ${phone}...`);

        try {
            // طلب كود الاقتران من واتساب
            const pairCode = await requestPairingCode(phone);
            
            if (!pairCode) {
                return bot.sendMessage(chatId, '❌ فشل في إنشاء الكود. حاول مرة أخرى');
            }

            // حفظ البيانات
            installData.pending[pairCode] = {
                phone: phone,
                telegramId: chatId,
                date: Date.now()
            };
            saveDB();

            await bot.sendMessage(chatId,
                `✅ *تم إنشاء كود الاقتران*\n\n` +
                `🔑 *الكود:* \`${pairCode}\`\n\n` +
                `📌 *الخطوات التالية:*\n` +
                `1️⃣ افتح واتساب على جوالك\n` +
                `2️⃣ اذهب إلى: الإعدادات > الأجهزة المرتبطة\n` +
                `3️⃣ اضغط "ربط جهاز" ثم "ربط برمز"\n` +
                `4️⃣ أدخل الكود أعلاه\n\n` +
                `⏳ بعد إدخال الكود، البوت سيعمل تلقائياً`,
                { parse_mode: 'Markdown' }
            );

            // إشعار للمالك
            if (chatId.toString() !== ownerId) {
                bot.sendMessage(ownerId,
                    `🔔 *تنصيب جديد*\n` +
                    `👤 المستخدم: ${msg.from.first_name}\n` +
                    `📱 الرقم: ${phone}\n` +
                    `🔑 الكود: ${pairCode}`,
                    { parse_mode: 'Markdown' }
                );
            }

        } catch (error) {
            bot.sendMessage(chatId, `❌ خطأ: ${error.message}`);
        }
    });

    // أمر /status
    bot.onText(/\/status/, (msg) => {
        const chatId = msg.chat.id;
        
        // البحث عن الرقم المرتبط
        let userPhone = null;
        for (let [phone, data] of Object.entries(installData.users)) {
            if (data.telegramId === chatId) {
                userPhone = phone;
                break;
            }
        }

        if (userPhone) {
            bot.sendMessage(chatId,
                `✅ *البوت مفعل*\n\n` +
                `📱 الرقم: ${userPhone}\n` +
                `📅 التاريخ: ${new Date(installData.users[userPhone].date).toLocaleString()}`,
                { parse_mode: 'Markdown' }
            );
        } else {
            bot.sendMessage(chatId, '❌ لا يوجد بوت مفعل لهذا الحساب');
        }
    });

    // أمر /broadcast (للمالك فقط)
    bot.onText(/\/broadcast (.+)/, (msg, match) => {
        if (msg.chat.id.toString() !== ownerId) return;
        
        const message = match[1];
        let sent = 0;
        
        for (let [phone, data] of Object.entries(installData.users)) {
            if (data.telegramId) {
                bot.sendMessage(data.telegramId, `📢 *إذاعة رسمية*\n\n${message}`, { parse_mode: 'Markdown' })
                    .then(() => sent++)
                    .catch(() => {});
            }
        }
        
        bot.sendMessage(ownerId, `✅ تم إرسال الإذاعة لـ ${sent} مستخدم`);
    });

    console.log('✅ بوت التليجرام جاهز');
    return bot;
}

// التحقق من اكتمال التنصيب (يتم استدعاؤها من messageHandler)
function completeInstallation(phone, sessionId) {
    for (let [code, data] of Object.entries(installData.pending)) {
        if (data.phone === phone) {
            const telegramId = data.telegramId;
            
            installData.users[phone] = {
                telegramId: telegramId,
                sessionId: sessionId,
                date: Date.now()
            };
            
            delete installData.pending[code];
            saveDB();
            
            // إرسال إشعار النجاح
            if (global.telegramBot) {
                global.telegramBot.sendMessage(telegramId,
                    `✅ *تم التنصيب بنجاح!*\n\n` +
                    `📱 الرقم: +${phone}\n` +
                    `🤖 البوت: يعمل الآن\n\n` +
                    `شكراً لاستخدامك البوت`,
                    { parse_mode: 'Markdown' }
                );
            }
            
            return true;
        }
    }
    return false;
}

module.exports = { startTelegramBot, completeInstallation };