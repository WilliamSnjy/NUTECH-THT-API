const express = require('express')
const {body, validationResult} = require('express-validator')
const router = express.Router()
const client = require('../connection/connection')
const response = require('../response/response')
const bcrypt = require('bcrypt')
const saltRounds = parseInt(process.env.SALTROUNDS);

router.post('/registration', [
    body('email').isEmail().withMessage('Parameter email tidak sesuai format'),
    body('password').isLength({ min:8 }).withMessage('password harus berisikan 8 karakter')
],(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const msg = errors.array()[0].msg
        return response (400, msg, null, res)
    }
    
    const {email, first_name, last_name, password} = req.body;
    const checkEmail = 'SELECT email FROM users WHERE email = $1'
    client.query(checkEmail, [email], (err,checkEmailResult) => {
        if(checkEmailResult.rows.length > 0){
            return response (400, 'Email sudah digunakan', null, res)
        }

        bcrypt.hash(password, saltRounds, (err, hash) => {
            if(err){
                return response (500, 'gagal enkripsi password', null, res)
            }

            const query = 'INSERT INTO users (email, first_name, last_name, password) VALUES ($1,$2,$3,$4) RETURNING *'
            client.query(query, [email, first_name, last_name, hash], (err, result) => {
                if(err){
                    return response(400, 'gagal registrasi', null, res)
                }
                return response (200, 'Registrasi berhasil silahkan login', null, res)
            })
        })
    })
})

module.exports = router;