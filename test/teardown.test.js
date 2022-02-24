const sever_modules = require('../server')
const supertest = require("supertest")
const db = require('../database')

// const request = supertest(sever_modules.app)
// const {describe} = require('mocha');
// const {expect} = require('chai');


// below code isnt really necesarry after the creation of the table
db.connect((err) => {
        if (err) console.log(err)
            // console.log("Connected!")
        var sql = "DELETE FROM User WHERE (email = 'test@user.com')"
        db.query(sql, (err, result) => {
            if (err) console.log(err)
            console.log("Table created")
        })
    })
    // name: 'test',
    // lastname: 'user',
    // password: '1234',
    // email: 'test@user.com',
    // permissionLevel: 'patient'