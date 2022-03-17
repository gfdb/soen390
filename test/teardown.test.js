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