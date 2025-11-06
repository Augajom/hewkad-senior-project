const db = require("../../config/db");

const Dashboard = {
    /**
     * ดึงสถิติทั้งหมดสำหรับหน้า Dashboard
     * @param {string} kadId - ถ้ามี filter ตลาด
     * @param {string} startDate - วันที่เริ่ม
     * @param {string} endDate - วันที่สิ้นสุด
     */
    getStats: (kadId = null, startDate = null, endDate = null) => {
        return new Promise((resolve, reject) => {
            let whereClause = "WHERE 1=1";
            const params = [];

            if (kadId && kadId !== "All") {
                whereClause += " AND p.kad_id = ?";
                params.push(kadId);
            }

            if (startDate && endDate) {
                whereClause += " AND o.ordered_at BETWEEN ? AND ?";
                params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
            }

            const query = `
        SELECT 
          o.id AS order_id,
          o.status_id,
          o.order_price,
          o.order_service_fee,
          o.ordered_at,
          p.kad_id,
          k.kad_name
        FROM orders o
        JOIN posts p ON o.post_id = p.id
        JOIN kad k ON p.kad_id = k.id
        ${whereClause}
      `;

            db.query(query, params, (err, results) => {
                if (err) return reject(err);

                const calPlatformFees = (fee) => (fee ? Math.round(fee * 0.3) : 0);

                let totalRevenue = 0;
                let pendingRevenue = 0;
                let paidOutToShoppers = 0;
                let platformFees = 0;
                const statusCounts = {};

                results.forEach((order) => {
                    const { status_id, order_price = 0, order_service_fee = 0 } = order;
                    const platformFee = calPlatformFees(order_service_fee);

                    totalRevenue += order_price + order_service_fee;

                    if (status_id === 5) {
                        pendingRevenue += (order_service_fee - platformFee) + order_price;
                    }

                    if (status_id === 8) {
                        paidOutToShoppers += (order_price + order_service_fee) - platformFee;
                        platformFees += platformFee;
                    }

                    statusCounts[status_id] = (statusCounts[status_id] || 0) + 1;
                });

                resolve({
                    totalRevenue,
                    pendingRevenue,
                    paidOutToShoppers,
                    platformFees,
                    totalOrders: results.length,
                    statusCounts,
                });
            });
        });
    },
};

module.exports = Dashboard;
