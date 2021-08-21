const axios = require('axios')
const bcrypt = require('bcrypt')
const Account = require('./models/account')
const { MongoClient } = require("mongodb")
const db = require('./db')
const cache_ttl = 3600;

const login = async (req, res) => {
    const body = req.body;
    const account = await Account.findOne({username: body.username});
    if(account){
        const validPass = await bcrypt.compare(body.pass, user.pass);
        if(validPass){
             return res.status(200).json({message: "Password match"});
        }else{
            return res.status(400).json({error: "Password incorrect"});
        }
    }
    else{
        return res.status(401).json({error: "User does not exist"});
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
        return res.status(400).json({ success: false, error: 'Invalid email' })
    }

    else if (!account || account.pass === '') {
        return res.status(400).json({ success: false, error: err })
    }

    else {
        if (!userExists) {
            const salt = await bcrypt.genSalt(10);
            account.pass = await bcrypt.hash(account.pass.toString(), salt);
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
    createAccount
}