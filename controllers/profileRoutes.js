const express = require('express')
const router = express.Router()
const response = require('../response/response')
const client = require('../connection/connection')
const multer = require('multer')
const fs = require('fs')
const path = require('path')

const storage = multer.diskStorage({
    destination: function (req, file,cb){
        cb(null, 'images')
    },
    filename: function (req, file, cb){
        cb(null, file.originalname)
    }
})


const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const allowedExt = ['.png', '.jpeg']
    if(!allowedExt.includes(ext)){
        const error = new Error ('Format image tidak sesuai')
        error.code = 'INVALID_FORMAT'
        return cb(error, false)
    }
    cb(null, true)
}

const upload = multer({ storage, fileFilter})

router.get('/profile', (req, res) => {
    const id_user = req.user.id;
    const query = 'SELECT email, first_name, last_name, profile_image FROM users WHERE id = $1'
    client.query(query, [id_user], (err, result) => {
        return response (200, 'sukses', result.rows[0], res)
    })
})

router.put('/profile/update', (req, res) => {
    const id_user = req.user.id;
    const {first_name, last_name} = req.body;
    const query = 'UPDATE users SET first_name = $1, last_name = $2 WHERE id = $3 RETURNING *'
    client.query(query, [first_name, last_name, id_user], (err, result) => {
        if(err){
            return response (400, 'gagal mengedit', null, res)
        }
        const datas = {
            email: result.rows[0].email,
            first_name: result.rows[0].first_name,
            last_name: result.rows[0].last_name,
            profile_image: result.rows[0].profile_image
        }
        return response (200, 'Update Profile berhasil', datas, res)
    })
})

router.put('/profile/image', (req, res) => {
    upload.single('profile_image')(req,res, function (err) {
        if(err){
            if(err.code === 'INVALID_FORMAT'){
                if(req.file && req.file.path){
                    fs.unlink(req.file.path, (deleteErr) => {
                        if (deleteErr) {
                            return response (500, 'gagal menghapus gambar', null, res)
                        }
                    })
                }
                return response(400, err.message, null, res)
            }
            return response(500, 'Server error saat upload', null, res)
        }

        if(!req.file){
            return response(400, 'file gambar tidak ditemukan', null, res)
        }

        const id_user = req.user.id;
        const profile_image = req.file.filename;
        const query = 'UPDATE users SET profile_image = $1 WHERE id = $2 RETURNING *'
        client.query(query, [profile_image, id_user], (err, result) => {
            if(err){
                return response (500, 'server error', null, res)
            }
            const datas = {
                email: result.rows[0].email,
                first_name: result.rows[0].first_name,
                last_name: result.rows[0].last_name,
                profile_image: result.rows[0].profile_image
            }
            return response (200, 'Update Profile Image Berhasil', datas, res)
        })
    })
})

module.exports = router;