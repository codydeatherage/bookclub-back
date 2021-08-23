const axios = require('axios')
const bcrypt = require('bcrypt')
const Account = require('./models/account')
const { MongoClient } = require("mongodb")
const db = require('./db')
const cache_ttl = 3600;
const salt = bcrypt.genSaltSync(10);
function compare(currPass, hashed) {
    bcrypt.compare(currPass, hashed, (err, res)=>{
        console.log(`comparing: ${currPass} || ${hashed}`)
    })
}

const login = async (req, res) => {
    const body = req.body;
    const account = await Account.findOne({ username: body.username });
    if (account) {
        body.pass = bcrypt.hash(body.pass.toString(), salt, (err, res)=>{
            console.log('hash', res);
            hash = res;
            compare(body.pass.toString(), account.pass);
        })
        const validPass = compare(body.pass, account.pass);
        if (validPass) {
            console.log('Account checks out')
            return res.status(200).json({ message: "Password match" });
        } else {
            console.log('no account match')
            return res.status(400).json({ error: "Password incorrect" });
        }
    }
    else {
        return res.status(400).json({ error: "User does not exist" });
    }
}

const createAccount = async (req, res) => {
    const body = req.body;
    let userExists = false;

    const account = new Account(body);
    console.log(body);
    const regEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;

    if (regEmail.test(account.username)) {
        const userCheck = await db.collection('accounts').findOne({ username: `${account.username}` })
        if (userCheck) {
            userExists = true;
        }
    }

    if (!regEmail.test(account.username)) {
        console.log('400 Invalid Email');
        return res.status(201).json({ success: false, message: 'Invalid email' })
    }

    else if (!account || account.pass === '') {
        return res.status(400).json({ success: false, message: 'Username and Password do not match' })
    }

    else {
        if (!userExists) {
            account.pass = await bcrypt.hash(account.pass.toString(), salt, (err, res)=>{
                hash = res;
                compare(hash);
            });
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
            return (res.status(400).json({ success: false, error: 'Username already exists' }))
        }
    }

}

module.exports = {
    login,
    createAccount
}