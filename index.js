require('dotenv').config()
const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000;

app.use(express.json());

const authenticateToken = require('./middleware/middleware')

const register = require('./auth/register')
const login = require('./auth/login')

const profileRoutes = require('./controllers/profileRoutes')
const bannerRoutes = require('./controllers/bannerRoutes')
const serviceRoutes = require('./controllers/serviceRoutes')
const balanceRoutes = require('./controllers/balanceRoutes')


app.get('/', (req, res) => {
    res.send('Hello World')
})
app.use('/', register)
app.use('/', login)

app.use('/', authenticateToken, profileRoutes)
app.use('/', bannerRoutes)
app.use('/', authenticateToken, serviceRoutes)
app.use('/', authenticateToken, balanceRoutes)

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})