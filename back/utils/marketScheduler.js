const cron = require('node-cron');
const SystemSettings = require('../models/SystemSettings');

const startMarketScheduler = () => {
  console.log('⏳ Market Scheduler Initialized (Timezone: Asia/Bangkok)');

  // ✅ เปิดตลาด: ทุกวัน เวลา 06:00 น.
  cron.schedule('0 6 * * *', async () => {
    console.log('⏰ Auto-Running: Opening Market...');
    try {
      await SystemSettings.updateMarketStatus(true);
      console.log('✅ Market Opened Successfully (06:00 AM)');
    } catch (error) {
      console.error('❌ Error opening market:', error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Bangkok"
  });

  // ⛔ ปิดตลาด: ทุกวัน เวลา 21:00 น. (3 ทุ่ม)
  cron.schedule('0 21 * * *', async () => {
    console.log('⏰ Auto-Running: Closing Market...');
    try {
      await SystemSettings.updateMarketStatus(false);
      console.log('✅ Market Closed Successfully (09:00 PM)');
    } catch (error) {
      console.error('❌ Error closing market:', error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Bangkok"
  });
};

module.exports = startMarketScheduler;