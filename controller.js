const axios = require('axios')
const bcrypt = require('bcrypt')
const Account = require('./models/account')
const db = require('./db')
const dotenv = require('dotenv');
dotenv.configure({ path: `${__dirname}/.env.local` })


const getVolumeData = async () => {
    await axios.get(`https://comicvine.gamespot.com/api/publisher/4010-10/?api_key=${process.env.API_KEY}&format=json`)
        .then((res) => {
            console.log(res);
        })
}

const login = async (req, res) => {
    const body = req.body;
    const account = await Account.findOne({ username: body.username });
    if (account) {
        bcrypt.compare(body.pass.toString(), account.pass.toString(), (err, result) => {
            if (err) { throw err }
            else if (result) {
                console.log('Password Match')
                return res.status(200).json({ message: "Password match" });
            } else {
                console.log("Password doesn't match");
                return res.status(400).json({ error: "Password incorrect" });
            }
        })
    }
    else {
        return res.status(400).json({ error: "User does not exist" });
    }
}

const createAccount = async (req, res) => {
    const body = req.body;
    const salt = bcrypt.genSaltSync(10);
    let userExists = false;
    const account = new Account(body);
    const regEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;
    if (regEmail.test(account.username)) {
        const userCheck = await db.collection('accounts').findOne({ username: `${account.username}` })
        userCheck && (userExists = true);
    }

    if (!regEmail.test(account.username) || !account || account.pass === '') {
        console.log('400 Invalid Email');
        return res.status(400).json({ success: false, message: 'Username or password invalid' })
    }
    else {
        if (!userExists) {
            account.pass = await bcrypt.hash(account.pass.toString(), salt)
            account.save().then(() => {
                console.log(`Account created  ${account.pass}`);
                return (res.status(201).json({
                    success: true,
                    id: account._id,
                    message: 'Account created!'
                }))
            })
                .catch(err => {
                    return res.status(400).json({
                        err,
                        message: 'Account not created!'
                    })
                })
        }
        else {
            console.log('401 User Already Exists');
            return (res.status(401).json({ success: false, error: 'Username already exists' }))
        }
    }
}

module.exports = {
    login,
    createAccount,
    getVolumeData
}