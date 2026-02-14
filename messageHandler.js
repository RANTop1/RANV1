// ====================================
// معالج الرسائل الرئيسي
// ====================================

const { handleCommand } = require('./commandHandler');
const { completeInstallation } = require('../core/telegram');

module.exports = async (client, msg) => {
    try {
        const sender = msg.from;
        const text = msg.body;
        const chat = await msg.getChat();
        const contact = await msg.getContact();
        const senderName = contact.pushname || contact.name || sender.split('@')[0];
        const isGroup = chat.isGroup;

        // التحقق من الكلمات الممنوعة
        if (isGroup && global.db.protection?.[chat.id._serialized]?.bannedWords) {
            const bannedWords = global.db.protection[chat.id._serialized].bannedWords;
            for (let word of bannedWords) {
                if (text.includes(word)) {
                    await msg.delete(true);
                    await msg.reply(showWarning(`🚫 الكلمة "${word}" ممنوعة`));
                    return;
                }
            }
        }

        // التحقق من منع الروابط
        if (isGroup && global.db.protection?.[chat.id._serialized]?.antiLink) {
            if (text.match(/https?:\/\/[^\s]+/g) || text.match(/www\.[^\s]+/g)) {
                await msg.delete(true);
                await msg.reply(showWarning('🚫 ممنوع إرسال الروابط'));
                return;
            }
        }

        // التحقق من منع السبام (بسيط)
        if (isGroup && global.db.protection?.[chat.id._serialized]?.antiSpam) {
            // يمكن إضافة منطق مكافحة السبام هنا
        }

        // معالجة الأوامر
        if (text.startsWith('.')) {
            const command = text.slice(1).trim().toLowerCase().split(' ')[0];
            const args = text.slice(1).trim().split(' ');
            
            await handleCommand(client, msg, chat, command, args, sender, senderName, isGroup);
        }

        // تسجيل الإحصائيات (اختياري)
        
    } catch (e) {
        console.log('❌ خطأ:', e.message);
    }
};