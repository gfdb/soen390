const express = require('express')
const router = express()
const bcrypt = require('bcrypt')
const db = require('../database')
const User = require('../models/users')


router.use(express.urlencoded({ extended: false }))

router.get('/', (req, res) => {
    res.render('signup_choice.ejs')

})
router.get('/patient/', (req, res) => {
    res.render('signup_patient.ejs')

})

router.get('/worker/', (req, res) => {
    res.render('signup_worker.ejs')

})

//post routers
router.post('/patient/', async(req, res) => {
    try {
        //hashes password
        const hashedPassword = await bcrypt.hash(req.body.pwd, 10)
        console.log(hashedPassword)

        const user = new User(req.body.fname, req.body.lname, hashedPassword, req.body.email, req.body.address,
            req.body.address2, req.body.city, req.body.province, req.body.zip)


        //stores user
        db.connect(function(err) {
            if (err) console.log(err)
            console.log("Connected!")
            var sql = "INSERT INTO Patients (uuid, name, lastName, email, password, address, address2, city, province, zip) VALUES (UUID(),'" + user.name + "','" + user.lastname + "','" + user.email + "','" + user.password + "','" + user.address + "','" + user.address2 + "','" + user.city + "','" + user.province + "','" + user.zip + "')";
            db.query(sql, function(err, result) {
                if (err) console.log(err)
                console.log("Number of records inserted: " + result.affectedRows)
            })
        })

        console.log("test")
        console.log(user)
        res.redirect('../login')
    } catch {
        res.redirect('./patient/')
    }

})


module.exports = router