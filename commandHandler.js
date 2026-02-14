// ====================================
// معالج الأوامر
// ====================================

const { showMainMenu, showError } = require('../utils/formatter');
const { handleAdminCommands } = require('../commands/admin');
const { handleMembersCommands } = require('../commands/members');
const { handleInstallCommands } = require('../commands/install');
const { handleProtectionCommands } = require('../commands/protection');
const { handleFunCommands } = require('../commands/fun');
const { handleGamesCommands } = require('../commands/games');
const { handleDevCommands } = require('../commands/dev');

module.exports = async (client, msg, chat, command, args, sender, senderName, isGroup) => {
    
    // تحديد رتبة المستخدم
    let userRole = 'user';
    if (global.db.ranks.owner.includes(sender) || sender.includes(process.env.OWNER_ID)) userRole = 'owner';
    else if (global.db.ranks.superAdmin.includes(sender)) userRole = 'superAdmin';
    else if (global.db.ranks.admin.includes(sender)) userRole = 'admin';
    else if (global.db.ranks.vip.includes(sender)) userRole = 'vip';
    
    const isAdmin = isGroup ? chat.participants.find(p => p.id._serialized === (msg.author || msg.from))?.isAdmin : true;

    // قائمة الأوامر
    if (command === 'الاوامر' || command === 'help' || command === 'menu') {
        return msg.reply(showMainMenu(senderName, userRole));
    }

    // أمر التيست
    if (command === 'تيست' || command === 'test') {
        return msg.reply(showSuccess(
            `البوت شغال 100%\n` +
            `📍 المكان: ${isGroup ? 'مجموعة' : 'خاص'}\n` +
            `⏰ الوقت: ${new Date().toLocaleTimeString('ar-EG')}`
        ));
    }

    // ===== قسم التنصيب =====
    if (['زرف', 'سحب'].includes(command)) {
        return handleInstallCommands(client, msg, chat, command, args, sender, userRole, isAdmin);
    }

    // ===== قسم الحماية =====
    if (['قفل_الروابط', 'فتح_الروابط', 'قفل_السبام', 'فتح_السبام',
         'قفل_الرفع', 'فتح_الرفع', 'قفل_التنزيل', 'فتح_التنزيل',
         'قفل_الاسم', 'فتح_الاسم', 'قفل_الوصف', 'فتح_الوصف',
         'قفل_الصورة', 'فتح_الصورة', 'منع_كلمة', 'الغاء_منع_كلمة',
         'الكلمات_الممنوعة', 'الحماية'].includes(command)) {
        return handleProtectionCommands(client, msg, chat, command, args, sender, userRole, isAdmin);
    }

    // ===== قسم المشرفين =====
    if (['رفع', 'تنزيل', 'طرد', 'كتم', 'فك_الكتم'].includes(command)) {
        return handleAdminCommands(client, msg, chat, command, args, isGroup, isAdmin);
    }

    // ===== قسم الأعضاء =====
    if (['منشن_الكل', 'الاعضاء', 'عدد_الاعضاء', 'اضافة', 'نقل_اعضاء'].includes(command)) {
        return handleMembersCommands(client, msg, chat, command, args, isGroup, isAdmin, sender, userRole);
    }

    // ===== قسم الألعاب =====
    if (['اخر_حرف', 'سؤال', 'لوخيروك'].includes(command)) {
        return handleGamesCommands(msg, chat, command, args);
    }

    // ===== قسم الترفيه =====
    if (['صراحة', 'نكتة', 'حكمة'].includes(command)) {
        return handleFunCommands(msg, chat, command, args);
    }

    // ===== قسم المطور =====
    if (['بوت', 'المطور', 'الاعضاء'].includes(command)) {
        return handleDevCommands(msg, chat, command, args);
    }

    // لو الأمر مش موجود
    if (command.startsWith('.')) {
        msg.reply(showError('الأمر غير موجود، استخدم .الاوامر'));
    }
};