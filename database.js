const mysql = require('mysql2')

const db = mysql.createConnection({
    host: '159.65.27.209',
    user: "gianf",
    password: "vx6k4GEf!",
    database: "soen390"
})

db.connect(function(err) {
    if (err) console.log(err)
    console.log("Connected!")
    var sql = "CREATE TABLE Users (name VARCHAR(255), lname VARCHAR(255), email VARCHAR(255), pwd VARCHAR(255))"
    db.query(sql, function(err, result) {
        if (err) console.log(err)
        console.log("Table created")
    })
})

module.exports = db