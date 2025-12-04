const nodemailer = require('nodemailer');
const db = require('../config/db'); // เชื่อมต่อ MySQL
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * ส่งอีเมลแจ้งลูกค้าเมื่อ Order ถูกยกเลิก
 * @param {number} postId - ใช้ post_id ใน table posts
 */
async function sendCancelEmailToCustomer(postId) {
  try {
    const [customer] = await new Promise((resolve, reject) => {
      const sql = `
        SELECT u.email, p.name
        FROM posts po
        JOIN orders o ON o.post_id = po.id
        JOIN users u ON o.customer_id = u.id   -- ใช้ customer_id แทน user_id
        LEFT JOIN profile p ON u.id = p.user_id
        WHERE po.id = ?
      `;
      db.query(sql, [postId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (!customer?.email) return console.warn(`⚠️ No customer email found for post ${postId}`);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: customer.email,
      subject: "แจ้งเตือน: ออเดอร์ของคุณถูกยกเลิก ❌",
      html: `
        <h3>สวัสดีคุณ ${customer.name || "ลูกค้า"}</h3>
        <p>ออเดอร์ของคุณจากโพสต์ #${postId} ถูกยกเลิกเรียบร้อยแล้ว</p>
        <p>คุณจะได้รับเงินคืนภายใน 1 ชั่วโมง โปรดตรวจสอบบัญชีของคุณหรือระบบ</p>
      `,
    });

    console.log(`📧 Cancel email sent to Customer: ${customer.email}`);
  } catch (error) {
    console.error("❌ Failed to send cancel email to customer:", error);
  }
}

module.exports = { sendCancelEmailToCustomer };
