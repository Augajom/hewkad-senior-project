// 📁 back/utils/reportMailer.js
require('dotenv').config();
const nodemailer = require('nodemailer');
const db = require('../config/db');

// ตั้งค่า transporter สำหรับ Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
async function sendRefundEmailToCustomer(orderId) {
  try {
    const [customer] = await new Promise((resolve, reject) => {
      const sql = `
        SELECT u.email, p.name
        FROM orders o
        JOIN users u ON o.customer_id = u.id
        JOIN profile p ON u.id = p.user_id
        WHERE o.id = ?
      `;
      db.query(sql, [orderId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (!customer?.email) return console.warn(`⚠️ No customer email found for order ${orderId}`);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: customer.email,
      subject: "แจ้งเตือน: การคืนเงินเรียบร้อยแล้ว 💰",
      html: `
        <h3>สวัสดีคุณ ${customer.name}</h3>
        <p>ออเดอร์ #${orderId} ที่คุณรายงานไว้ ได้รับการคืนเงินเรียบร้อยแล้ว</p>
        <p>กรุณาตรวจสอบบัญชีของคุณหรือระบบเพื่อดูสถานะการคืนเงิน</p>
      `,
    });

    console.log(`📧 Refund email sent to Customer: ${customer.email}`);
  } catch (error) {
    console.error("❌ Failed to send refund email to customer:", error);
  }
}


/**
 * ส่งอีเมลแจ้ง Rider ให้ไปแก้งาน (เมื่อ reason_id เป็น 2,3,4)
 */
async function sendReportReopenEmailToRider(orderId) {
  try {
    const [rider] = await new Promise((resolve, reject) => {
      const sql = `
        SELECT u.email, p.name
        FROM orders o
        JOIN users u ON o.rider_id = u.id
        JOIN profile p ON u.id = p.user_id
        WHERE o.id = ?
      `;
      db.query(sql, [orderId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (!rider?.email) return console.warn(`⚠️ No rider email found for order ${orderId}`);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: rider.email,
      subject: "แจ้งเตือน: งานของคุณต้องแก้ไข 🛠️",
      html: `
        <h3>สวัสดีคุณ ${rider.name}</h3>
        <p>ออเดอร์ #${orderId} ที่คุณรับงานไว้ได้รับการรายงานจากลูกค้า</p>
        <p>ระบบได้เปลี่ยนสถานะเป็น <b>Ordering</b> เพื่อให้คุณเข้าไปแก้ไขงานตามคำร้องขอ</p>
      `,
    });

    console.log(`📧 Reopen email sent to Rider: ${rider.email}`);
  } catch (error) {
    console.error("❌ Failed to send reopen email to rider:", error);
  }
}


async function sendReportReopenEmailToCustomer(orderId) {
  try {
    const [customer] = await new Promise((resolve, reject) => {
      const sql = `
        SELECT u.email, p.name
        FROM orders o
        JOIN users u ON o.customer_id = u.id
        JOIN profile p ON u.id = p.user_id
        WHERE o.id = ?
      `;
      db.query(sql, [orderId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (!customer?.email) return console.warn(`⚠️ No customer email found for order ${orderId}`);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: customer.email,
      subject: "แจ้งเตือน: Rider กำลังดำเนินการแก้งานของคุณ 🔄",
      html: `
        <h3>สวัสดีคุณ ${customer.name}</h3>
        <p>ออเดอร์ #${orderId} ที่คุณรายงานไว้ กำลังถูกแก้ไขโดย Rider</p>
      `,
    });

    console.log(`📧 Reopen email sent to Customer: ${customer.email}`);
  } catch (error) {
    console.error("❌ Failed to send reopen email to customer:", error);
  }
}


module.exports = {
  sendRefundEmailToCustomer,
  sendReportReopenEmailToRider,
  sendReportReopenEmailToCustomer
};