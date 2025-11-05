const db = require("../../config/db.js");

const banks = {
  getAll: async () => {
    const [rows] = await db.promise().query('SELECT id, bank_name FROM bank ORDER BY bank_name ASC');
    return rows;
  },
};

module.exports = banks;