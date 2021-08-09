const express = require('express')
const cors = require('cors')
const db = require('./db')
const router = require('./router')
require('dotenv').config();
const app = express()
const apiPort = 3000

app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(express.json())

db.on('error', console.error.bind(console, 'MongoDB connection error:'))

app.get('/', (req, res) => {
    res.send('bookclub town')
})

app.use('/api', router)

app.listen(apiPort, process.env.IP, () => console.log(`Server running on port ${apiPort}`))