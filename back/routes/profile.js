const router = require("express").Router();
const db = require("../config/db");

const nn = (v) => (v === undefined || v === null || v === "" ? null : v);

router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.promise().query(
      `
      SELECT
        p.id AS profileId,
        p.user_id AS userId,
        p.name,
        p.nickname,
        p.email,
        p.phone_num AS phone,
        p.address,
        p.picture,
        p.identity_file AS identityFile,
        p.identity_file_name AS identityFileName,
        b.bank_name AS bank,
        pba.acc_number AS accountNumber,
        pba.acc_owner AS accountOwner
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
      fullName: rows?.[0]?.name ?? req.user.fullName ?? null,
      nickname: rows?.[0]?.nickname ?? null,
      email: rows?.[0]?.email ?? req.user.email ?? null,
      roles: req.user.roles ?? [],
      picture: rows?.[0]?.picture ?? req.user.picture ?? null,
    };

    return res.json(rows[0] ? { ...base, ...rows[0] } : base);
  } catch (err) {
    console.error("[GET /profile] error:", err);
    return res.status(500).json({ error: "Failed to load profile" });
  }
});

router.put("/", async (req, res) => {
  const userId = req.user.id;
  const {
    fullName,
    phone,
    address,
    picture,
    identityFile,
    identityFileName,
    bank,
    accountNumber,
    accountOwner,
  } = req.body || {};

  const conn = db.promise();

  try {
    // หาโปรไฟล์เดิม
    const [exist] = await conn.query(
      "SELECT id FROM profile WHERE user_id = ? LIMIT 1",
      [userId]
    );

    let profileId;

    if (exist.length) {
      profileId = exist[0].id;
      await conn.query(
        `UPDATE profile
         SET name=?, phone_num=?, address=?, picture=?, identity_file=?, identity_file_name=?
         WHERE id=?`,
        [
          nn(fullName),
          nn(phone),
          nn(address),
          nn(picture),
          nn(identityFile),
          nn(identityFileName),
          profileId,
        ]
      );
    } else {
      // ดึง email ปัจจุบันจาก users/profile เพื่อคงค่าเดิม
      const [[userRow]] = await conn.query(
        "SELECT email FROM users WHERE id=? LIMIT 1",
        [userId]
      );
      const currentEmail = userRow?.email ?? null;

      const [ins] = await conn.query(
        `INSERT INTO profile
         (user_id, name, nickname, email, phone_num, address, picture, identity_file, identity_file_name)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          nn(fullName),
          nn(currentEmail),
          nn(phone),
          nn(address),
          nn(picture),
          nn(identityFile),
          nn(identityFileName),
        ]
      );
      profileId = ins.insertId;
    }

    // ----- bank upsert (เหมือนเดิม) -----
    let bankId = null;
    if (bank !== undefined && bank !== null && bank !== "") {
      const numeric = Number(bank);
      if (!Number.isNaN(numeric) && Number.isInteger(numeric)) {
        bankId = numeric;
      } else {
        const [bRows] = await conn.query(
          "SELECT id FROM bank WHERE bank_name = ? LIMIT 1",
          [String(bank)]
        );
        if (bRows.length) bankId = bRows[0].id;
        else {
          const [insB] = await conn.query(
            "INSERT INTO bank (bank_name) VALUES (?)",
            [String(bank)]
          );
          bankId = insB.insertId;
        }
      }
    }

    if (bankId || accountNumber || accountOwner) {
      const [pbaRows] = await conn.query(
        "SELECT id FROM profile_bank_accounts WHERE profile_id = ? LIMIT 1",
        [profileId]
      );
      if (pbaRows.length) {
        await conn.query(
          "UPDATE profile_bank_accounts SET bank_id=?, acc_number=?, acc_owner=? WHERE id=?",
          [nn(bankId), nn(accountNumber), nn(accountOwner), pbaRows[0].id]
        );
      } else {
        await conn.query(
          "INSERT INTO profile_bank_accounts (profile_id, bank_id, acc_number, acc_owner) VALUES (?, ?, ?, ?)",
          [profileId, nn(bankId), nn(accountNumber), nn(accountOwner)]
        );
      }
    }

    // ดึงข้อมูลล่าสุดคืน
    const [rows] = await conn.query(
      `
      SELECT
        p.id AS profileId,
        p.user_id AS userId,
        p.name,
        p.nickname,
        p.email,
        p.phone_num AS phone,
        p.address,
        p.picture,
        p.identity_file AS identityFile,
        p.identity_file_name AS identityFileName,
        b.bank_name AS bank,
        pba.acc_number AS accountNumber,
        pba.acc_owner AS accountOwner
      FROM profile p
      LEFT JOIN profile_bank_accounts pba ON pba.profile_id = p.id
      LEFT JOIN bank b ON b.id = pba.bank_id
      WHERE p.user_id = ?
      LIMIT 1
      `,
      [userId]
    );

    const latest = rows[0] || {};
    const response = {
      id: userId,
      fullName: latest.name ?? req.user.fullName ?? null,
      nickname: latest.nickname ?? null,
      email: latest.email ?? req.user.email ?? null, // ✅ ยังส่งกลับให้แสดงผลได้ แต่ไม่แก้
      roles: req.user.roles ?? [],
      picture: latest.picture ?? req.user.picture ?? null,
      ...latest,
    };

    return res.json({ ok: true, profile: response });
  } catch (err) {
    console.error("[PUT /profile] error:", err);
    return res.status(500).json({ error: "Failed to save profile" });
  }
});

module.exports = router;
