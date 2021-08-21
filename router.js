const express = require('express')
const LoginCtrl = require('./controller')
const router = express.Router()

router.post('/signup', LoginCtrl.createAccount);
router.post('/login', LoginCtrl.login);

module.exports = router