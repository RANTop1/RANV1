// ====================================
// أوامر المشرفين
// ====================================

const { showSuccess, showError } = require('../utils/formatter');

async function handleAdminCommands(client, msg, chat, command, args, isGroup, isAdmin) {
    
    if (!isGroup) return msg.reply(showError('هذه الأوامر للمجموعات فقط'));
    if (!isAdmin) return msg.reply(showError('أنت لست مشرفاً'));

    // رفع مشرف
    if (command === 'رفع') {
        const mentioned = await msg.getMentions();
        if (mentioned.length === 0) return msg.reply(showError('منشن العضو'));
        
        try {
            await chat.promoteParticipants([mentioned[0].id._serialized]);
            msg.reply(showSuccess(`تم رفع ${mentioned[0].pushname || 'العضو'} مشرف`));
        } catch (e) {
            msg.reply(showError('فشل الرفع'));
        }
    }

    // تنزيل مشرف
    if (command === 'تنزيل') {
        const mentioned = await msg.getMentions();
        if (mentioned.length === 0) return msg.reply(showError('منشن العضو'));
        
        try {
            await chat.demoteParticipants([mentioned[0].id._serialized]);
            msg.reply(showSuccess(`تم تنزيل ${mentioned[0].pushname || 'العضو'}`));
        } catch (e) {
            msg.reply(showError('فشل التنزيل'));
        }
    }

    // طرد عضو
    if (command === 'طرد') {
        const mentioned = await msg.getMentions();
        if (mentioned.length === 0) return msg.reply(showError('منشن العضو'));
        
        try {
            await chat.removeParticipants([mentioned[0].id._serialized]);
            msg.reply(showSuccess(`تم طرد ${mentioned[0].pushname || 'العضو'}`));
        } catch (e) {
            msg.reply(showError('فشل الطرد'));
        }
    }

    // كتم عضو
    if (command === 'كتم') {
        const mentioned = await msg.getMentions();
        if (mentioned.length === 0) return msg.reply(showError('منشن العضو'));
        
        const time = parseInt(args[2]) || 60;
        
        global.db.groups = global.db.groups || {};
        global.db.groups[chat.id._serialized] = global.db.groups[chat.id._serialized] || { muted: {} };
        global.db.groups[chat.id._serialized].muted[mentioned[0].id._serialized] = {
            until: Date.now() + (time * 60000)
        };
        
        msg.reply(showSuccess(`تم كتم ${mentioned[0].pushname || 'العضو'} لمدة ${time} دقيقة`));
    }

    // فك الكتم
    if (command === 'فك_الكتم') {
        const mentioned = await msg.getMentions();
        if (mentioned.length === 0) return msg.reply(showError('منشن العضو'));
        
        if (global.db.groups?.[chat.id._serialized]?.muted?.[mentioned[0].id._serialized]) {
            delete global.db.groups[chat.id._serialized].muted[mentioned[0].id._serialized];
            msg.reply(showSuccess(`تم فك الكتم عن ${mentioned[0].pushname || 'العضو'}`));
        }
    }
}

module.exports = { handleAdminCommands };