const express = require('express')
const LoginCtrl = require('./controller')
const router = express.Router()

router.post('/signup', LoginCtrl.createAccount)

module.exports = router