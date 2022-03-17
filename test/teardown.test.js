const db = require('../database')
const supertest = require("supertest")
const { describe } = require('mocha');
const { expect } = require('chai');


// below code is for deleting the test user in test teardown

var sql = "DELETE FROM User WHERE (email = 'david@example.com')"
db.query(sql, (err, result) => {
    if (err) console.log(err)
    else console.log('Rows affected' + result.affectedRows)
})
var sql2 = `DELETE FROM Messages WHERE sender_uuid = '1' AND receiver_uuid = '3' AND date_time = (SELECT * FROM (select m.date_time FROM Messages m WHERE m.sender_uuid='1' AND m.receiver_uuid = '3' ORDER BY date_time DESC LIMIT 1) AS TEMP)`
db.query(sql2, (err, result) => {
    if (err) console.log(err)
    else console.log('Rows affected' + result.affectedRows)
})