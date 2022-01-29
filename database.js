const mysql = require('mysql2')

const db = mysql.createConnection({
    host: '159.65.27.209',
    user: "gianf",
    password: "vx6k4GEf!",
    database: "soen390"
})


// below code isnt really necesarry after the creation of the table
// db.connect((err) => {
//     if (err) console.log(err)
//     console.log("Connected!")
//     var sql = "CREATE TABLE Patients (uuid VARCHAR(64), name VARCHAR(255), lastName VARCHAR(255), email VARCHAR(255), password VARCHAR(256), address VARCHAR(256), address2 VARCHAR(256), city VARCHAR (256), province VARCHAR(256), zip VARCHAR(256))"
//     db.query(sql, (err, result) => {
//         if (err) console.log(err)
//         console.log("Table created")
//     })
// })


// deleting table

// db.connect(function(err) {
//     if (err) console.log(err)
//     let sql = "DROP TABLE Users"
//     db.query(sql, function(err, result) {
//         if (err) console.log(err)
//         console.log("Table deleted")
//     })
// })

//viewing
// let sql = 'SELECT * FROM Patients';
// db.query(sql, function(err, data, fields) {
//     console.log(data)
//     if (err) throw err;
// })
module.exports = db