const db = require("../config/db");

const SystemSettings = {
    // ดึงสถานะตลาด
    getMarketStatus: () => {
        return new Promise((resolve, reject) => {
            db.query(
                "SELECT setting_value FROM system_settings WHERE setting_key = 'market_open'",
                (err, results) => {
                    if (err) return reject(err);
                    if (results.length === 0) resolve(true);
                    else {
                        resolve(String(results[0].setting_value) === '1');
                    }
                }
            );
        });
    },

    // อัปเดตสถานะตลาด
    updateMarketStatus: (isOpen) => {
        return new Promise((resolve, reject) => {
            const value = isOpen ? '1' : '0';
            db.query(
                "UPDATE system_settings SET setting_value = ? WHERE setting_key = 'market_open'",
                [value],
                (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                }
            );
        });
    }
};

module.exports = SystemSettings;