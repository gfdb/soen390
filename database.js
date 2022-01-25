const mysql = require('mysql2')

module.exports = mysql.createConnection({
    host:  "159.65.27.209",
    user:  "gianf",
    passwd: "vx6k4GEf!",
    database:  "soen390",
    // auth_plugin = "mysql_native_password"
})
