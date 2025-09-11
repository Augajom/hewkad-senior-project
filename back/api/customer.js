const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Customer route working' });
});



module.exports = router;