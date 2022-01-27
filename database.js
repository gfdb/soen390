const mysql = require('mysql2')

const db = mysql.createConnection({
    host: '159.65.27.209',
    user: "gianf",
    password: "vx6k4GEf!",
    database: "soen390"
})

//below code isnt really necesarry after the creation of the table
// db.connect((err) => {
//     if (err) console.log(err)
//     console.log("Connected!")
//     var sql = "CREATE TABLE Users (uuid VARCHAR(64), name VARCHAR(255), lastName VARCHAR(255), email VARCHAR(255), password VARCHAR(256))"
//     db.query(sql, (err, result) => {
//         if (err) console.log(err)
//         console.log("Table created")
//     })
// })

module.exports = db