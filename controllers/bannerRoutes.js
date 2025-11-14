const express = require('express')
const router = express.Router()
const response = require('../response/response')
const client = require('../connection/connection')

router.get('/banner', (req, res) => {
    query = 'SELECT banner_name, banner_image, description FROM banner'
    client.query(query, (err, result) => {
        if(err){
            return response(400, 'gagal mengambil data', null, res)
        }
        const datas = result.rows
        return response(200, 'Sukses', datas, res)
    })
})

module.exports = router;