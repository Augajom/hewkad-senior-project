// routes/profile.js
const router = require('express').Router();
const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const express = require('express');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
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

    const row = rows?.[0] || {};
    const base = {
      id: userId,
      email: row.email || req.user.email || null,
      fullName: row.fullName || req.user.fullName || null,
      roles: req.user.roles || []
    };

    const picture = normalizePicture(firstNonEmpty(row.picture, req.user?.picture));
    const identityFile = row.identityFile ? normalizePath(row.identityFile) : null;

    console.log('GET /profile -> identityFile =', identityFile);

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.json({ ...row, ...base, picture, identityFile });
  } catch (e) {
    console.error('GET /profile error:', e);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

// ---------- PUT /profile (ข้อมูลโปรไฟล์ + avatar) ----------
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
      'SELECT id, email, nickname, name, phone_num, address, picture FROM profile WHERE user_id = ? LIMIT 1',
      [userId]
    );

    const exists = !!pRows.length;
    const current = pRows[0] || {};
    const currentPicture = current.picture ?? '';

    let newAvatarUrl = null;
    if (req.file && req.file.filename) newAvatarUrl = `/uploads/${req.file.filename}`;

    const pictureToSave = normalizePicture(firstNonEmpty(newAvatarUrl, picture, currentPicture, req.user.picture));

    const fields = [];
    const params = [];
    const addIfProvided = (column, incoming) => {
      if (incoming === undefined) return;
      fields.push(`${column} = ?`);
      params.push(nonEmpty(incoming));
    };

    addIfProvided('nickname', nickname);
    addIfProvided('name', fullName);
    addIfProvided('phone_num', phone);
    addIfProvided('address', address);

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

    // ธนาคาร (ถ้าส่งมา)
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

    // โหลดกลับ
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

// ---------- PUT /profile/identity (อัปโหลดทันที) ----------
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
      newIdentityUrl = `/uploads/${req.file.filename}`;
      console.log('UPLOAD identity ->', newIdentityUrl);
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

    const [rows] = await conn.query(
      `SELECT identity_file AS identityFile FROM profile WHERE user_id = ? LIMIT 1`,
      [userId]
    );
    const saved = rows?.[0]?.identityFile || null;
    console.log('SAVED identity_file ->', saved);

    return res.json({ ok: true, profile: { identityFile: saved } });
  } catch (e) {
    console.error('PUT /profile/identity error:', e);
    return res.status(500).json({ error: 'Failed to save identity', detail: e.message });
  }
});

module.exports = router;
