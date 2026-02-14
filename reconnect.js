// ====================================
// نظام إعادة الاتصال
// ====================================

const { initializeClient } = require('./client');

function setupReconnect(client) {
    console.log('⏳ محاولة إعادة الاتصال بعد 10 ثواني...');
    
    setTimeout(() => {
        try {
            client.destroy();
        } catch (e) {}
        
        initializeClient();
    }, 10000);
}

module.exports = { setupReconnect };