// routes/profile.js
const router = require('express').Router();
const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const express = require('express');
const banksModel = require('../models/customer/bank'); // โมเดล banks สำหรับดึง bank list

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads', 'identity');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.png';
    const uid = req.user && req.user.id ? String(req.user.id) : 'u';
    const prefix = (file.fieldname || 'file').toLowerCase(); // avatar/identity
    cb(null, `${prefix}_${uid}_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.use(express.json());

function nonEmpty(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}
function firstNonEmpty(...vals) {
  for (const v of vals) {
    const t = nonEmpty(v);
    if (t !== null) return t;
  }
  return '';
}
function normalizePath(p) {
  if (!p) return '';
  const s = String(p);
  return s.split('?')[0]; // กัน query string ยาว
}
function normalizePicture(p) {
  return normalizePath(p);
}

// ---------- GET /profile ----------
router.get('/', async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const userId = req.user.id;
    const conn = db.promise();

    // ดึง profile + bank account ของผู้ใช้
    const [profileRows] = await conn.query(
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
        p.identity_file AS identityFile,
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

    const row = profileRows?.[0] || {};
    const base = {
      id: userId,
      email: row.email || req.user.email || null,
      fullName: row.fullName || req.user.fullName || null,
      roles: req.user.roles || []
    };
    const picture = normalizePicture(firstNonEmpty(row.picture, req.user?.picture));
    const identityFile = row.identityFile ? normalizePath(row.identityFile) : null;

    // ดึง bank list จากโมเดล
    const banks = await banksModel.getAll();

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.json({
      ...row,
      ...base,
      picture,
      identityFile,
      banks
    });
  } catch (e) {
    console.error('GET /profile error:', e);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

// ---------- PUT /profile (ข้อมูลโปรไฟล์ + avatar + bank) ----------
const maybeUpload = (req, res, next) => {
  const ct = (req.headers['content-type'] || '').toLowerCase();
  if (ct.startsWith('multipart/form-data')) {
    return upload.single('avatar')(req, res, next);
  }
  return next();
};

router.put('/', maybeUpload, async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const userId = req.user.id;
    const body = req.body || {};
    const { nickname, fullName, phone, address, picture, bank, accountNumber, accountOwner } = body;

    const conn = db.promise();
    const [pRows] = await conn.query(
      'SELECT id, picture FROM profile WHERE user_id = ? LIMIT 1',
      [userId]
    );

    const exists = !!pRows.length;
    const current = pRows[0] || {};
    let newAvatarUrl = req.file?.filename ? `/uploads/avatars/${req.file.filename}` : null;

    const pictureToSave = normalizePicture(firstNonEmpty(newAvatarUrl, picture, current.picture, req.user.picture));

    // --- update / insert profile ---
    let profileId;
    if (!exists) {
      const [ins] = await conn.query(
        `INSERT INTO profile (user_id, nickname, name, email, phone_num, address, picture)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          nonEmpty(nickname),
          nonEmpty(fullName),
          req.user.email || null,
          nonEmpty(phone),
          nonEmpty(address),
          pictureToSave
        ]
      );
      profileId = ins.insertId;
    } else {
      const fields = [];
      const params = [];
      if (nickname !== undefined) { fields.push('nickname=?'); params.push(nonEmpty(nickname)); }
      if (fullName !== undefined) { fields.push('name=?'); params.push(nonEmpty(fullName)); }
      if (phone !== undefined) { fields.push('phone_num=?'); params.push(nonEmpty(phone)); }
      if (address !== undefined) { fields.push('address=?'); params.push(nonEmpty(address)); }
      if (newAvatarUrl !== null || picture !== undefined) { fields.push('picture=?'); params.push(pictureToSave); }

      if (fields.length) {
        await conn.query(`UPDATE profile SET ${fields.join(', ')} WHERE id=?`, [...params, current.id]);
      }
      profileId = current.id;
    }

    // --- update / insert bank account ---
    const wantUpdateBank = bank !== undefined || accountNumber !== undefined || accountOwner !== undefined;
    if (wantUpdateBank) {
      const bankIdVal = bank ? Number(bank) : null; // bank dropdown ส่งเป็น id
      const [existingAcc] = await conn.query(
        'SELECT id FROM profile_bank_accounts WHERE profile_id = ? LIMIT 1',
        [profileId]
      );

      if (!bankIdVal) {
        // ไม่เลือก bank → ลบ record ถ้ามี
        if (existingAcc.length) {
          await conn.query('DELETE FROM profile_bank_accounts WHERE id=?', [existingAcc[0].id]);
        }
      } else {
        if (existingAcc.length) {
          await conn.query(
            `UPDATE profile_bank_accounts
             SET bank_id=?, acc_number=?, acc_owner=?
             WHERE id=?`,
            [bankIdVal, nonEmpty(accountNumber), nonEmpty(accountOwner), existingAcc[0].id]
          );
        } else {
          await conn.query(
            `INSERT INTO profile_bank_accounts (profile_id, bank_id, acc_number, acc_owner)
             VALUES (?, ?, ?, ?)`,
            [profileId, bankIdVal, nonEmpty(accountNumber), nonEmpty(accountOwner)]
          );
        }
      }
    }

    // โหลดกลับ profile + bank
    const [rows] = await conn.query(
      `SELECT
         p.id            AS profileId,
         p.user_id       AS userId,
         p.nickname      AS nickname,
         p.name          AS fullName,
         p.email,
         p.phone_num     AS phone,
         p.address,
         p.picture,
         p.identity_file AS identityFile,
         b.id            AS bankId,
         b.bank_name     AS bank,
         pba.acc_number  AS accountNumber,
         pba.acc_owner   AS accountOwner
       FROM profile p
       LEFT JOIN profile_bank_accounts pba ON pba.profile_id = p.id
       LEFT JOIN bank b ON b.id = pba.bank_id
       WHERE p.user_id = ?
       LIMIT 1`,
      [userId]
    );

    const row = rows?.[0] || {};
    const effectivePicture = normalizePicture(firstNonEmpty(row.picture, req.user?.picture));
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.json({ ok: true, profile: { ...row, picture: effectivePicture } });
  } catch (e) {
    console.error('PUT /profile error:', e);
    res.status(500).json({ error: 'Failed to save profile', detail: e.message });
  }
});

// ---------- PUT /profile/identity ----------
const maybeIdentityUpload = (req, res, next) => {
  const ct = (req.headers['content-type'] || '').toLowerCase();
  if (ct.startsWith('multipart/form-data')) {
    return upload.single('identity')(req, res, next);
  }
  return next();
};

router.put('/identity', maybeIdentityUpload, async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const userId = req.user.id;
    const conn = db.promise();

    const [pRows] = await conn.query(
      'SELECT id, identity_file FROM profile WHERE user_id = ? LIMIT 1',
      [userId]
    );
    const exists = !!pRows.length;
    const current = pRows[0] || {};

    let newIdentityUrl = null;
    if (req.file?.filename) {
      newIdentityUrl = `/uploads/identity/${req.file.filename}`;
    }

    const bodyIdentity = (req.body?.identity ?? '').trim() || null;
    const identityToSave = normalizePath(firstNonEmpty(newIdentityUrl, bodyIdentity, current.identity_file)) || null;

    if (!exists) {
      await conn.query(
        `INSERT INTO profile (user_id, identity_file, email, name)
         VALUES (?, ?, ?, ?)`,
        [userId, identityToSave, req.user.email || null, req.user.fullName || null]
      );
    } else {
      await conn.query(
        `UPDATE profile SET identity_file = ? WHERE id = ?`,
        [identityToSave, current.id]
      );
    }

    const [roleRows] = await conn.query(
      `SELECT * FROM user_roles WHERE user_id = ? AND role_id = 2 LIMIT 1`,
      [userId]
    );

    if (roleRows.length > 0) {
      await conn.query(
        `UPDATE user_roles SET is_Active = 2 WHERE user_id = ? AND role_id = 2`,
        [userId]
      );
    } else {
      await conn.query(
        `INSERT INTO user_roles (user_id, role_id, is_Active)
     VALUES (?, 2, 2)`,
        [userId]
      );
    }

    const [rows] = await conn.query(
      `SELECT identity_file AS identityFile FROM profile WHERE user_id = ? LIMIT 1`,
      [userId]
    );
    const saved = rows?.[0]?.identityFile || null;

    return res.json({ ok: true, profile: { identityFile: saved } });
  } catch (e) {
    console.error('PUT /profile/identity error:', e);
    return res.status(500).json({ error: 'Failed to save identity', detail: e.message });
  }
});

module.exports = router;
