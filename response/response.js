const response = (status,message,data, res) => {
    res.status(status).json( {
        status: status,
        message: message,
        data: data
    })
}

module.exports = response