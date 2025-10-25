const db = require("../../config/db");

const Proof = {
  saveProofUrl: (order_id, proof_url) => {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE orders SET Proof_url = ? WHERE post_id = ?",
        [proof_url, order_id],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  },
};

module.exports = Proof;