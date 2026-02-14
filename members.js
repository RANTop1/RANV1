// ====================================
// أوامر الأعضاء
// ====================================

const { showSuccess, showError, showInfo } = require('../utils/formatter');

async function handleMembersCommands(client, msg, chat, command, args, isGroup, isAdmin, sender, userRole) {
    
    if (!isGroup) return msg.reply(showError('هذه الأوامر للمجموعات فقط'));

    // ===== منشن لكل الأعضاء =====
    if (command === 'منشن_الكل') {
        if (!isAdmin && userRole !== 'owner' && userRole !== 'superAdmin') {
            return msg.reply(showError('هذا الأمر للمشرفين فقط'));
        }
        
        const reason = args.slice(1).join(' ') || 'تاغ عام';
        const participants = chat.participants;
        
        let mentions = [];
        let mentionText = `🔔 *تاغ عام*\n📝 ${reason}\n\n`;
        
        for (let participant of participants) {
            if (!participant.id._serialized.includes(client.info.wid._serialized)) {
                mentions.push(participant.id._serialized);
                mentionText += `@${participant.id.user} `;
            }
        }
        
        await msg.reply(mentionText, { mentions: mentions });
    }

    // ===== عدد الأعضاء =====
    if (command === 'عدد_الاعضاء') {
        const total = chat.participants.length;
        const admins = chat.participants.filter(p => p.isAdmin).length;
        
        msg.reply(showInfo('إحصائيات المجموعة',
            `👥 إجمالي الأعضاء: ${total}\n` +
            `👑 المشرفين: ${admins}\n` +
            `👤 الأعضاء: ${total - admins}`
        ));
    }

    // ===== قائمة الأعضاء =====
    if (command === 'الاعضاء') {
        let membersList = '📋 *قائمة الأعضاء*\n\n';
        let count = 0;
        
        for (let p of chat.participants) {
            if (!p.isAdmin) {
                count++;
                membersList += `${count}. @${p.id.user}\n`;
            }
        }
        
        msg.reply(membersList, {
            mentions: chat.participants.filter(p => !p.isAdmin).map(p => p.id._serialized)
        });
    }

    // ===== إضافة عضو =====
    if (command === 'اضافة') {
        if (!isAdmin && userRole !== 'owner' && userRole !== 'superAdmin') {
            return msg.reply(showError('هذا الأمر للمشرفين فقط'));
        }
        
        let phone = args[1]?.replace(/\D/g, '');
        if (!phone) return msg.reply(showError('استخدم: .اضافة 966501234567'));
        
        if (!phone.startsWith('966')) {
            phone = '966' + phone.replace(/^0+/, '');
        }
        
        await msg.reply(showInfo('جاري الإضافة', `الرقم: ${phone}`));
        
        try {
            await chat.addParticipants([`${phone}@c.us`]);
            msg.reply(showSuccess(`تمت إضافة ${phone} بنجاح`));
        } catch (e) {
            msg.reply(showError(`فشل الإضافة: ${e.message}`));
        }
    }

    // ===== نقل أعضاء =====
    if (command === 'نقل_اعضاء' && (userRole === 'owner' || userRole === 'superAdmin' || isAdmin)) {
        const targetGroupLink = args[1];
        const mentioned = await msg.getMentions();
        
        if (!targetGroupLink) {
            return msg.reply(showError('استخدم: .نقل_اعضاء https://chat.whatsapp.com/xxxx @منشن'));
        }
        
        if (mentioned.length === 0) {
            return msg.reply(showError('منشن الأعضاء اللي تبي تنقلهم'));
        }
        
        await msg.reply(showInfo('جاري النقل', `عدد الأعضاء: ${mentioned.length}`));
        
        try {
            const inviteCode = targetGroupLink.split('chat.whatsapp.com/')[1];
            const targetChat = await client.acceptInvite(inviteCode);
            
            let success = 0;
            for (let member of mentioned) {
                try {
                    await targetChat.addParticipants([member.id._serialized]);
                    success++;
                    await new Promise(r => setTimeout(r, 2000));
                } catch (e) {}
            }
            
            msg.reply(showSuccess(`تم نقل ${success} عضو بنجاح إلى ${targetChat.name}`));
        } catch (e) {
            msg.reply(showError('فشل الوصول للمجموعة: ' + e.message));
        }
    }
}

module.exports = { handleMembersCommands };