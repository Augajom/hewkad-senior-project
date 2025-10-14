require('dotenv').config();
const nodemailer = require('nodemailer');
const Ordering = require('../models/customer/Ordering');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * ✅ ฟังก์ชันส่งอีเมลแจ้งว่าไรเดอร์รับออเดอร์แล้ว
 * @param {string} email - อีเมลของลูกค้า
 * @param {string} nickname - ชื่อลูกค้า
 * @param {string} product - ชื่อสินค้า
 * @param {string} store_name - ร้านค้า
 */
async function sendOrderReceivedEmail(email, nickname, product, store_name) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "มีไรเดอร์รับออเดอร์ของคุณแล้ว!",
    html: `
      <h3>📦 สวัสดีคุณ ${nickname || "ลูกค้า"}</h3>
      <p>ออเดอร์ของคุณจากร้าน <b>${store_name}</b> สินค้า: <b>${product}</b></p>
      <p>ได้รับการยืนยันรับโดยไรเดอร์แล้ว ✅</p>
      <p>สถานะปัจจุบัน: <b>Rider Received</b></p>
      <hr />
      <p style="font-size: 12px; color: gray;">ขอบคุณที่ใช้บริการจากเรา ❤️</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to: ${email}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    return { success: false, error };
  }
}
async function sendPaymentReceivedEmail(serviceEmail, customerName, product, storeName) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: serviceEmail,
    subject: `ลูกค้า ${customerName} ชำระเงินแล้ว!`,
    html: `
      <h3>📦 การชำระเงินได้รับแล้ว</h3>
      <p>ลูกค้าคุณ <b>${customerName}</b> ชำระเงินสำหรับออเดอร์จากร้าน <b>${storeName}</b></p>
      <p>สินค้า: <b>${product}</b></p>
      <p>สถานะออเดอร์: <b>Ordering</b></p>
      <hr />
      <p style="font-size: 12px; color: gray;">โปรดเตรียมตัวเพื่อจัดส่ง</p>
    `
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendOrderReceivedEmail };