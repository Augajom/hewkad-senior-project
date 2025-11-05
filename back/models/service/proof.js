const db = require("../../config/db");

const Proof = {
  saveProofUrl: (post_id, proof_url) => {
    return new Promise((resolve, reject) => {
      db.query(
        `UPDATE orders 
         SET Proof_url = ?, completed_at = NOW() 
         WHERE post_id = ?`,
        [proof_url, post_id],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  },
};

module.exports = Proof;
