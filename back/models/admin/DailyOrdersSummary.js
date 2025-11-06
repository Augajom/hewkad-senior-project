const cron = require("node-cron");
const db = require("../../config/db");

cron.schedule("59 23 * * *", () => { // 1. เอา async ออก
    console.log("⏰ Running daily summary job...");

    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);

    db.query(
        `SELECT 
            COUNT(*) AS total_orders, 
            SUM(order_price + order_service_fee) AS total_revenue
         FROM orders
         WHERE DATE(ordered_at) = ?`,
        [dateStr],
        (err, rows) => { // 3. นี่คือ Callback ที่ 1
            if (err) {
                console.error("❌ Error in cron job (SELECT):", err);
                return; // จบการทำงานถ้า query แรกพลาด
            }

            const { total_orders, total_revenue } = rows[0];

            // 4. เรียก query ที่ 2 ซ้อนเข้ามาข้างใน
            db.query(
                `INSERT INTO daily_orders_summary (date, total_orders, total_revenue)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE total_orders = ?, total_revenue = ?`,
                [dateStr, total_orders, total_revenue, total_orders, total_revenue],
                (insertErr, result) => { // 5. นี่คือ Callback ที่ 2
                    if (insertErr) {
                        console.error("❌ Error in cron job (INSERT):", insertErr);
                        return;
                    }
                    console.log(`✅ Saved summary for ${dateStr}`);
                }
            );
        }
    );
});