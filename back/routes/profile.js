const router = require('express').Router();
const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.png';
    const uid = req.user && req.user.id ? String(req.user.id) : 'u';
    cb(null, `avatar_${uid}_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

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
function normalizePicture(p) {
  if (!p) return '';
  const s = String(p);
  if (s.startsWith('/uploads/')) return s.split('?')[0];
  return s;
}

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

    const row = rows?.[0] || {};
    const base = {
      id: userId,
      email: row.email || req.user.email || null,
      fullName: row.fullName || req.user.fullName || null,
      roles: req.user.roles || []
    };

    const picture = normalizePicture(firstNonEmpty(row.picture, req.user?.picture));
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.json({ ...row, ...base, picture });
  } catch {
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

const express = require('express');
router.use(express.json()); // เผื่อกรณีที่ server ยังไม่ได้ใส่ไว้ (ปลอดภัยไว้ก่อน)

const maybeUpload = (req, res, next) => {
  const ct = (req.headers['content-type'] || '').toLowerCase();
  if (ct.startsWith('multipart/form-data')) {
    return upload.single('avatar')(req, res, next); // มีไฟล์ → ใช้ multer
  }
  return next(); // เป็น JSON → ข้าม multer
};

router.put('/', maybeUpload, async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    const userId = req.user.id;
    const body = req.body || {};
    const { nickname, fullName, phone, address, picture, bank, accountNumber, accountOwner } = body;

    const conn = db.promise();
    const [pRows] = await conn.query(
      'SELECT id, email, nickname, name, phone_num, address, picture FROM profile WHERE user_id = ? LIMIT 1',
      [userId]
    );

    const exists = !!pRows.length;
    const current = pRows[0] || {};
    const currentPicture = current.picture ?? '';

    let newAvatarUrl = null;
    if (req.file && req.file.filename) newAvatarUrl = `/uploads/${req.file.filename}`;

    // ถ้าไม่อัปโหลดไฟล์ จะไม่มี req.file -> ใช้ค่าที่ส่งมาใน JSON แทน (picture) หรือค่าเดิม
    const pictureToSave = normalizePicture(firstNonEmpty(newAvatarUrl, picture, currentPicture, req.user.picture));

    const fields = [];
    const params = [];
    const addIfProvided = (column, incoming, _currentVal) => {
      if (incoming === undefined) return;
      fields.push(`${column} = ?`);
      params.push(nonEmpty(incoming));
    };

    addIfProvided('nickname', nickname, current.nickname);
    addIfProvided('name', fullName, current.name);
    addIfProvided('phone_num', phone, current.phone_num);
    addIfProvided('address', address, current.address);

    // picture จะอัปเดตเฉพาะกรณีส่งมา หรือมีไฟล์ใหม่
    if (newAvatarUrl !== null || picture !== undefined) {
      fields.push('picture = ?');
      params.push(pictureToSave);
    }

    let profileId;
    if (!exists) {
      const insertCols = ['user_id', 'nickname', 'name', 'email', 'phone_num', 'address', 'picture'];
      const insertVals = [
        userId,
        nonEmpty(nickname) ?? null,
        nonEmpty(fullName) ?? null,
        req.user.email || null,
        nonEmpty(phone) ?? null,
        nonEmpty(address) ?? null,
        pictureToSave
      ];
      const placeholders = insertCols.map(() => '?').join(', ');
      const [ins] = await conn.query(
        `INSERT INTO profile (${insertCols.join(', ')}) VALUES (${placeholders})`,
        insertVals
      );
      profileId = ins.insertId;
    } else {
      if (fields.length) {
        await conn.query(`UPDATE profile SET ${fields.join(', ')} WHERE id = ?`, [...params, current.id]);
      }
      profileId = current.id;
    }

    // อัปเดตข้อมูลธนาคารเฉพาะเมื่อส่งฟิลด์ที่เกี่ยวข้องมา
    const wantUpdateBank =
      bank !== undefined || accountNumber !== undefined || accountOwner !== undefined;

    if (wantUpdateBank) {
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
        const [bRows] = await conn.query('SELECT id FROM bank WHERE bank_name = ? LIMIT 1', [bankName]);
        let bankIdVal = bRows.length ? bRows[0].id : null;
        if (!bankIdVal) {
          const [insB] = await conn.query('INSERT INTO bank (bank_name) VALUES (?)', [bankName]);
          bankIdVal = insB.insertId;
        }

        if (existingAcc.length) {
          await conn.query(
            `UPDATE profile_bank_accounts
             SET bank_id = ?, acc_number = ?, acc_owner = ?
             WHERE id = ?`,
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

    // โหลดกลับส่งให้ frontend
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
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    return res.json({ ok: true, profile: { ...row, picture: effectivePicture } });
  } catch (e) {
    console.error('PUT /profile error:', e);
    return res.status(500).json({ error: 'Failed to save profile', detail: e.message });
  }
});


module.exports = router;
