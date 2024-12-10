const express = require('express');
const router = express.Router();
const { generateTempMail, fetchEmails } = require('../controllers/tempMailController');
const auth = require('../middleware/auth');

router.get('/generate', auth, generateTempMail);
router.post('/fetch', auth, fetchEmails);

module.exports = router; 