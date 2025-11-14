const jwt = require('jsonwebtoken')
const response = require('../response/response')

const secretKey = process.env.JWT_SECRET

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];
    if(!token){
        return response (401, 'token tidak ditemukan', null, res)
    }
    jwt.verify(token, secretKey, (err, user) => {
        if(err){
            return response (401, 'token tidak valid atau kadaluwarsa', null, res)
        }
        
        req.user = user;
        next();
    })
}

module.exports = authenticateToken