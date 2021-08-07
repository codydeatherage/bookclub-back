const axios = require('axios')
const Account = require('./models/account')
const cache_ttl = 3600;

const createAccount = (req, res) =>{
    const body = req.body;

    if(!body){
        return res.status(400).json({
            success: false,
            error: 'No username/password'
        })
    }

    const account = new Account(body);
    if(!account){
        return res.status(400).json({success: false, error: err})
    }

    account.save().then(()=>{
        return(res.status(201).json({
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



module.exports = {
    createAccount
}