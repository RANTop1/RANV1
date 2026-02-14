// ====================================
// أوامر المطور
// ====================================

const { showSuccess, showInfo } = require('../utils/formatter');

function handleDevCommands(msg, chat, command) {
    
    if (command === 'بوت') {
        msg.reply(showSuccess(
            `البوت شغال\n` +
            `📊 الإصدار: v3.0\n` +
            `🤖 الاسم: ${process.env.BOT_NAME || 'Meliodas'}`
        ));
    }

    if (command === 'المطور') {
        msg.reply(showInfo('المطور',
            `👤 الاسم: ${process.env.SPONSOR_NAME || 'ريـان'}\n` +
            `⚡ الحالة: نشط\n` +
            `🤖 البوت: ${process.env.BOT_NAME || 'Meliodas'}`
        ));
    }

    if (command === 'الاعضاء') {
        if (!chat.isGroup) return msg.reply('هذا الأمر للمجموعات فقط');
        
        let admins = [];
        let members = [];
        
        for (let p of chat.participants) {
            if (p.isAdmin) {
                admins.push(`👑 @${p.id.user}`);
            } else {
                members.push(`👤 @${p.id.user}`);
            }
        }
        
        const list = 
            `*المشرفين (${admins.length})*\n${admins.join('\n')}\n\n` +
            `*الأعضاء (${members.length})*\n${members.slice(0, 20).join('\n')}` +
            (members.length > 20 ? `\n...و ${members.length - 20} آخرون` : '');
        
        msg.reply(list, {
            mentions: chat.participants.map(p => p.id._serialized)
        });
    }
}

module.exports = { handleDevCommands };