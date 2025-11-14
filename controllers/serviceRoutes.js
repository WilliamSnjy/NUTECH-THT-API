const express = require('express')
const router = express.Router()
const response = require('../response/response')
const client = require('../connection/connection')

router.get('/services', (req, res) => {
    query = 'SELECT service_code, service_name, service_icon, service_tariff FROM services'
    client.query(query, (err, result) => {
        if(err){
            return response(400, 'gagal mengambil data services', null, res)
        }
        const datas = result.rows
        return response(200, 'Sukses', datas, res)
    })
})

router.post('/transaction', (req, res) => {
    const id_user = req.user.id;
    const {service_code} = req.body;
    const invoiceNumber = `INV-${Date.now()}`;
    const date = new Date();
    const type = 'PAYMENT';

    const query = 'SELECT * FROM services WHERE service_code = $1'
    client.query(query, [service_code], (err, serviceResult) => {
        if(err){
            return response(400, 'Service status Layanan tidak ditemukan', null, res)
        }
        const serviceId = serviceResult.rows[0].id;
        const serviceName = serviceResult.rows[0].service_name;
        const amount = serviceResult.rows[0].service_tariff;
        const getBalance = 'SELECT balance FROM users WHERE id = $1'
        client.query(getBalance, [id_user], (err, getBalanceResult) => {
            if(err){
                return response(400, 'gagal mengambil data balance', null, res)
            }

            const balanceData = getBalanceResult.rows[0].balance
            if(balanceData - amount < 0){
                return response (400, 'balance anda tidak cukup', null, res)
            }else {
                const updateBalance = 'UPDATE users SET balance = balance - $1 WHERE id = $2 RETURNING balance'
                client.query(updateBalance, [amount, id_user], (err, updatebalanceResult) => {
                    if(err){
                        return response (400, 'gagal mengupdate balance', null, res)
                    }
                    const transactionQuery = 'INSERT INTO transactions (invoice_number, transaction_type, total_amount, created_on, id_user, id_service, description) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *'
                    client.query(transactionQuery, [invoiceNumber, type, amount, date, id_user, serviceId, serviceName], (err, transactionResult) => {
                        if(err){
                            return response(400, 'gagal memasukkan data ke transaksi', null, res)
                        }
                        const datas = {
                            invoice_number: invoiceNumber,
                            service_code: service_code,
                            service_name: serviceName,
                            transaction_type: type,
                            total_amount: amount,
                            created_on: date
                        }
                        return response(200, 'Transaksi berhasil', datas, res)
                    })
                })
            }
        })
    })
})

router.get('/transaction/history', (req, res) => {
    const id_user = req.user.id;
    const query = 'SELECT invoice_number, transaction_type, description, total_amount, created_on FROM transactions WHERE id_user = $1 ORDER BY created_on ASC'
    client.query(query, [id_user], (err, result) => {
        if(err){
            return response (400, 'gagal mengambil data', null, res)
        }
        const datas = result.rows
        return response (200, 'Get History Berhasil', datas, res)
    })
})

module.exports = router;