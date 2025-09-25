const router = require('express').Router();
const db = require('../config/db');

/** ================================
 * GET /profile  → โหลดโปรไฟล์ของ user ปัจจุบัน
 * ================================ */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.promise().query(
      `
      SELECT
        p.id            AS profileId,
        p.user_id       AS userId,
        p.nickname      AS nickname,
        p.name          AS fullName,
        p.email,
        p.phone_num     AS phone,
        p.address,
        p.picture,
        b.id            AS bankId,
        b.bank_name     AS bank,
        pba.acc_number  AS accountNumber,
        pba.acc_owner   AS accountOwner
      FROM profile p
      LEFT JOIN profile_bank_accounts pba ON pba.profile_id = p.id
      LEFT JOIN bank b ON b.id = pba.bank_id
      WHERE p.user_id = ?
      LIMIT 1
      `,
      [userId]
    );

    const base = {
      id: userId,
      email: rows?.[0]?.email || req.user.email || null,
      fullName: rows?.[0]?.fullName || req.user.fullName || null,
      roles: req.user.roles || [],
    };

    return res.json(rows[0] ? { ...rows[0], ...base } : base);
  } catch (err) {
    console.error('[GET /profile] error:', err);
    return res.status(500).json({ error: 'Failed to load profile' });
  }
});

/** ==========================================
 * PUT /profile  → สร้าง/แก้ไขโปรไฟล์ของ user
 * body: { nickname, fullName, phone, address, picture, bank, accountNumber, accountOwner }
 * ========================================== */
router.put('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      nickname,
      fullName,
      phone,
      address,
      picture,
      bank,
      accountNumber,
      accountOwner,
    } = req.body || {};

    const conn = db.promise();

    // หา/สร้าง profile
    const [pRows] = await conn.query(
      'SELECT id, email, picture FROM profile WHERE user_id = ? LIMIT 1',
      [userId]
    );

    const currentPicture = pRows[0]?.picture ?? '';
    let profileId;

    if (!pRows.length) {
      const userEmail = req.user.email || null;
      const [ins] = await conn.query(
        `
        INSERT INTO profile
          (user_id, nickname, name, email, phone_num, address, picture)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          userId,
          nickname ?? null,
          fullName ?? null,
          userEmail ?? null,
          phone ?? null,
          address ?? null,
          (picture ?? currentPicture ?? ''),
        ]
      );
      profileId = ins.insertId;
    } else {

      profileId = pRows[0].id;
      await conn.query(
        `
        UPDATE profile
        SET nickname = ?, name = ?, phone_num = ?, address = ?, picture = ?
        WHERE id = ?
        `,
        [
          nickname ?? null,
          fullName ?? null,
          phone ?? null,
          address ?? null,
          (picture ?? currentPicture ?? ''),
          profileId,
        ]
      );
    }


    const bankName = (bank || '').trim();
    const [existingAcc] = await conn.query(
      'SELECT id FROM profile_bank_accounts WHERE profile_id = ? LIMIT 1',
      [profileId]
    );

    if (!bankName) {

      if (existingAcc.length) {
        await conn.query('DELETE FROM profile_bank_accounts WHERE id = ?', [existingAcc[0].id]);
      }
    } else {
      // ensure bank id
      const [bRows] = await conn.query(
        'SELECT id FROM bank WHERE bank_name = ? LIMIT 1',
        [bankName]
      );
      let bankIdVal = bRows.length ? bRows[0].id : null;
      if (!bankIdVal) {
        const [insB] = await conn.query('INSERT INTO bank (bank_name) VALUES (?)', [bankName]);
        bankIdVal = insB.insertId;
      }

      if (existingAcc.length) {
        await conn.query(
          `
          UPDATE profile_bank_accounts
          SET bank_id = ?, acc_number = ?, acc_owner = ?
          WHERE id = ?
          `,
          [bankIdVal, accountNumber ?? null, accountOwner ?? null, existingAcc[0].id]
        );
      } else {
        await conn.query(
          `
          INSERT INTO profile_bank_accounts (profile_id, bank_id, acc_number, acc_owner)
          VALUES (?, ?, ?, ?)
          `,
          [profileId, bankIdVal, accountNumber ?? null, accountOwner ?? null]
        );
      }
    }

    // ตอบกลับโปรไฟล์ล่าสุด
    const [rows] = await conn.query(
      `
      SELECT
        p.id            AS profileId,
        p.user_id       AS userId,
        p.nickname      AS nickname,
        p.name          AS fullName,
        p.email,
        p.phone_num     AS phone,
        p.address,
        p.picture,
        b.id            AS bankId,
        b.bank_name     AS bank,
        pba.acc_number  AS accountNumber,
        pba.acc_owner   AS accountOwner
      FROM profile p
      LEFT JOIN profile_bank_accounts pba ON pba.profile_id = p.id
      LEFT JOIN bank b ON b.id = pba.bank_id
      WHERE p.user_id = ?
      LIMIT 1
      `,
      [userId]
    );

    return res.json({ ok: true, profile: rows[0] || null });
  } catch (err) {
    console.error('[PUT /profile] error:', err);
    return res.status(500).json({ error: 'Failed to save profile' });
  }
});

module.exports = router;
