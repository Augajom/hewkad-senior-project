    const express = require('express');
    const router = express.Router();

    router.post('/', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
    });

    return res.json({ ok: true, message: 'Logout success' });
    });

    module.exports = router;
