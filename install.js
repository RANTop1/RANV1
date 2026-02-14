// ====================================
// أوامر التنصيب - زرف وسحب
// ====================================

const { showSuccess, showError, showInfo } = require('../utils/formatter');

async function handleInstallCommands(client, msg, chat, command, args, sender, userRole, isAdmin) {
    
    if (!chat.isGroup) return msg.reply(showError('هذه الأوامر للمجموعات فقط'));

    // ===== زرف = طرد كل الأعضاء + تغيير الاسم =====
    if (command === 'زرف' && (userRole === 'owner' || userRole === 'superAdmin' || isAdmin)) {
        
        await msg.reply(showInfo('⚠️ جاري تنفيذ الزرف', 'الرجاء الانتظار...'));
        
        try {
            // تغيير اسم المجموعة
            const sponsorName = global.db.settings.sponsorName;
            const sponsorTag = global.db.settings.sponsorTag;
            await chat.setSubject(`برعاية ${sponsorName}؟ ${sponsorTag}`);
            
            // تغيير وصف المجموعة
            await chat.setDescription('تبي تعرف كيف انزرفت؟');
            
            // طرد كل الأعضاء ما عدا البوت
            const botId = client.info.wid._serialized;
            let removed = 0;
            let failed = 0;
            
            for (let participant of chat.participants) {
                if (participant.id._serialized !== botId) {
                    try {
                        await chat.removeParticipants([participant.id._serialized]);
                        removed++;
                        await new Promise(r => setTimeout(r, 1500));
                    } catch (e) {
                        failed++;
                    }
                }
            }
            
            msg.reply(showSuccess(
                `تم الزرف بنجاح 💥\n` +
                `👥 تم طرد: ${removed}\n` +
                `❌ فشل: ${failed}`
            ));
            
        } catch (e) {
            msg.reply(showError('فشل الزرف: ' + e.message));
        }
    }

    // ===== سحب = تنزيل كل المشرفين =====
    if (command === 'سحب' && (userRole === 'owner' || userRole === 'superAdmin' || isAdmin)) {
        
        await msg.reply(showInfo('⚠️ جاري تنفيذ السحب', 'تنزيل المشرفين...'));
        
        try {
            const botId = client.info.wid._serialized;
            let demoted = 0;
            let failed = 0;
            
            for (let participant of chat.participants) {
                if (participant.isAdmin && participant.id._serialized !== botId) {
                    try {
                        await chat.demoteParticipants([participant.id._serialized]);
                        demoted++;
                        await new Promise(r => setTimeout(r, 1000));
                    } catch (e) {
                        failed++;
                    }
                }
            }
            
            msg.reply(showSuccess(
                `تم السحب بنجاح 🔻\n` +
                `👑 تم تنزيل: ${demoted} مشرف\n` +
                `❌ فشل: ${failed}`
            ));
            
        } catch (e) {
            msg.reply(showError('فشل السحب: ' + e.message));
        }
    }
}

module.exports = { handleInstallCommands };