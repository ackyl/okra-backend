const mysql = require('mysql')

const conn = mysql.createConnection(
    {
        user: 'devuser',
        password: '12345',
        host: 'localhost',
        database: 'okra',
        port : 3306,
        insecureAuth: true
    }
)

module.exports = conn
