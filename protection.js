// ====================================
// أوامر الحماية المتطورة
// ====================================

const { showSuccess, showError, showInfo } = require('../utils/formatter');

async function handleProtectionCommands(client, msg, chat, command, args, sender, userRole, isAdmin) {
    
    if (!chat.isGroup) return msg.reply(showError('هذه الأوامر للمجموعات فقط'));
    if (!isAdmin && userRole !== 'owner' && userRole !== 'superAdmin') {
        return msg.reply(showError('هذه الأوامر للمشرفين فقط'));
    }

    // تهيئة إعدادات الحماية
    global.db.protection = global.db.protection || {};
    global.db.protection[chat.id._serialized] = global.db.protection[chat.id._serialized] || {
        antiLink: false,
        antiSpam: false,
        antiPromote: false,
        antiDemote: false,
        antiNameChange: false,
        antiDescriptionChange: false,
        antiIconChange: false,
        bannedWords: []
    };

    const protection = global.db.protection[chat.id._serialized];

    // أوامر القفل والفتح
    const toggleCommands = {
        'قفل_الروابط': 'antiLink',
        'فتح_الروابط': 'antiLink',
        'قفل_السبام': 'antiSpam',
        'فتح_السبام': 'antiSpam',
        'قفل_الرفع': 'antiPromote',
        'فتح_الرفع': 'antiPromote',
        'قفل_التنزيل': 'antiDemote',
        'فتح_التنزيل': 'antiDemote',
        'قفل_الاسم': 'antiNameChange',
        'فتح_الاسم': 'antiNameChange',
        'قفل_الوصف': 'antiDescriptionChange',
        'فتح_الوصف': 'antiDescriptionChange',
        'قفل_الصورة': 'antiIconChange',
        'فتح_الصورة': 'antiIconChange'
    };

    if (toggleCommands[command]) {
        const setting = toggleCommands[command];
        const isLock = command.startsWith('قفل');
        protection[setting] = isLock;
        
        const settingNames = {
            antiLink: 'الروابط',
            antiSpam: 'السبام',
            antiPromote: 'رفع المشرفين',
            antiDemote: 'تنزيل المشرفين',
            antiNameChange: 'تغيير الاسم',
            antiDescriptionChange: 'تغيير الوصف',
            antiIconChange: 'تغيير الصورة'
        };
        
        return msg.reply(showSuccess(`${isLock ? '🔒 قفل' : '🔓 فتح'} ${settingNames[setting]}`));
    }

    // منع كلمة
    if (command === 'منع_كلمة') {
        const word = args.slice(1).join(' ');
        if (!word) return msg.reply(showError('اكتب الكلمة المطلوب منعها'));
        
        if (!protection.bannedWords.includes(word)) {
            protection.bannedWords.push(word);
            msg.reply(showSuccess(`تمت إضافة كلمة "${word}" للقائمة السوداء`));
        } else {
            msg.reply(showError('الكلمة موجودة بالفعل'));
        }
    }

    // إلغاء منع كلمة
    if (command === 'الغاء_منع_كلمة') {
        const word = args.slice(1).join(' ');
        if (!word) return msg.reply(showError('اكتب الكلمة المطلوب إزالتها'));
        
        protection.bannedWords = protection.bannedWords.filter(w => w !== word);
        msg.reply(showSuccess(`تمت إزالة كلمة "${word}" من القائمة السوداء`));
    }

    // عرض الكلمات الممنوعة
    if (command === 'الكلمات_الممنوعة') {
        if (protection.bannedWords.length === 0) {
            return msg.reply(showInfo('📝 الكلمات الممنوعة', 'لا توجد كلمات ممنوعة'));
        }
        
        const wordsList = protection.bannedWords.map((w, i) => `${i+1}. ${w}`).join('\n');
        msg.reply(showInfo('📝 الكلمات الممنوعة', wordsList));
    }

    // عرض لوحة الحماية
    if (command === 'الحماية') {
        const status = (b) => b ? '✅ مفعل' : '❌ معطل';
        
        const menu = `🛡️ *لوحة تحكم الحماية*

╭━━━━━━━━━━━━━━╮
┃ 🔰 *حماية المحتوى*
╰━━━━━━━━━━━━━━╯
🔗 الروابط: ${status(protection.antiLink)}
📊 السبام: ${status(protection.antiSpam)}

╭━━━━━━━━━━━━━━╮
┃ 👑 *حماية المشرفين*
╰━━━━━━━━━━━━━━╯
⬆️ منع الرفع: ${status(protection.antiPromote)}
⬇️ منع التنزيل: ${status(protection.antiDemote)}

╭━━━━━━━━━━━━━━╮
┃ ✏️ *حماية الإعدادات*
╰━━━━━━━━━━━━━━╯
📝 تغيير الاسم: ${status(protection.antiNameChange)}
📋 تغيير الوصف: ${status(protection.antiDescriptionChange)}
🖼️ تغيير الصورة: ${status(protection.antiIconChange)}

╭━━━━━━━━━━━━━━╮
┃ 📝 *كلمات ممنوعة*
╰━━━━━━━━━━━━━━╯
📌 العدد: ${protection.bannedWords.length}`;
        
        msg.reply(menu);
    }
}

module.exports = { handleProtectionCommands };