const express = require('express')
const router = express.Router()
const response = require('../response/response')
const client = require('../connection/connection')

router.get('/balance', (req, res) => {
    const id_user = req.user.id;
    const query = 'SELECT balance FROM users WHERE id = $1'
    client.query(query, [id_user], (err, result) => {
        if(err){
            return response(400, 'gagal mengambil data balance anda', null, res)
        }
        const datas = result.rows[0]
        return response(200, 'Get Balance Berhasil', datas, res)
    })
})

router.post('/topup', (req, res) => {
    const id_user = req.user.id;
    const {top_up_amount} = req.body;
    const invoice_number = `INV-${Date.now()}`;
    const date = new Date();
    const desc = 'Top Up Balance';
    const serviceId = 0;

    if(Number(top_up_amount) <= 0 || isNaN(top_up_amount)){
        return response(400, 'Parameter amount hanya boleh angka dan tidak boleh lebih kecil dari 0', null, res)
    }

    const query = 'INSERT INTO transactions (invoice_number, transaction_type, total_amount, created_on, id_user, id_service, description) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *'
    client.query(query, [invoice_number, 'TOPUP', top_up_amount, date, id_user, serviceId, desc], (err, topupResult) => {
        if(err){
            return response (500, 'gagal memasukkan topup', null, res)
        }
        const sumQuery = 'UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING balance'
        client.query(sumQuery, [top_up_amount, id_user], (err, sumResult) => {
            if(err){
                return response(400, 'gagal menambahkan balance', null, res)
            }
            const balances = sumResult.rows[0]
            return response(200, 'Topup Balance berhasil', balances, res)
        })
    })
})

module.exports = router;