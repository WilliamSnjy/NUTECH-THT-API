const express = require('express')
const {body, validationResult } = require('express-validator')
const router = express.Router()
const client = require('../connection/connection')
const response = require('../response/response')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const secretKey = process.env.JWT_SECRET

router.post('/login', [
    body('email').isEmail().withMessage('Parameter email tidak sesuai format'),
    body('password').isLength({ min:8 }).withMessage('Password harus berisikan 8 karakter')
],(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const msg = errors.array()[0].msg
        return response (400, msg, null, res)
    }
    const {email, password} = req.body;
    const query = 'SELECT * FROM users WHERE email = $1'
    client.query(query, [email], (err, result) => {
        if(err){
            return (500, 'login error', null, res)
        }

        const user = result.rows[0]
        if(!user){
            return response (401, 'email tidak ditemukan', null, res)
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if(err){
                return response (500, 'server error', null, res)
            }

            if(!isMatch){
                return response (401, 'email atau password salah', null, res)
            }

            const load = { id: user.id, email:user.email};
            const token = jwt.sign(load, secretKey, {expiresIn:'12h'})

            return response (200, 'Login sukses', {token}, res)
        })
    })
})

module.exports = router;