require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * ✅ ฟังก์ชันส่งอีเมลแจ้งว่ารายงานถูกแก้ไขเรียบร้อยแล้ว
 * @param {string} email - อีเมลของลูกค้า
 * @param {string} nickname - ชื่อลูกค้า
 * @param {string} product - ชื่อสินค้า (ถ้ามี)
 * @param {string} storeName - ชื่อร้าน (ถ้ามี)
 */
async function sendReportResolvedEmail(email, nickname, product = '', storeName = '') {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "รายงานของคุณถูกแก้ไขเรียบร้อยแล้ว ✅",
    html: `
      <h3>สวัสดีคุณ ${nickname || "ลูกค้า"}</h3>
      <p>รายงานที่คุณส่งเกี่ยวกับออเดอร์${product ? `: <b>${product}</b>` : ''}${storeName ? ` จากร้าน <b>${storeName}</b>` : ''} ได้รับการแก้ไขเรียบร้อยแล้ว</p>
      <p>คุณสามารถตรวจสอบสถานะออเดอร์และรายละเอียดการแก้ไขได้ในระบบ</p>
      <hr />
      <p style="font-size: 12px; color: gray;">ขอบคุณที่ใช้บริการจากเรา ❤️</p>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Report resolved email sent to: ${email}`);
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
  } catch (error) {
    console.error("❌ Failed to send report resolved email:", error);
  }
}

module.exports = { sendReportResolvedEmail };
