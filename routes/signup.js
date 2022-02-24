const express = require('express')
const router = express()
const bcrypt = require('bcrypt')
const db = require('../database')
const User = require('../models/user')

router.use(express.urlencoded({ extended: false }))

router.get('/', (req, res) => {
    res.render('signup_patient.ejs')

})

// post for signup
router.post('/', async(req, res) => {
    // try the following
    try {
        // hash the password the user entered
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        // create user model with sign up info
        const user = new User(null, req.body.name, req.body.lastName, req.body.email, req.body.permissionLevel)

        // query the database to check that a user with that email does not already exist
        db.query("SELECT email FROM User WHERE email = '" + user.email + "'", function(err, result, field) {
                // if user does not exist 
                if (result.length === 0) {
                    db.connect((err) => {
                            if (err) console.log(err)
                            console.log("Connected!")

                            // if no error, insert User model into the database
                            var sql = "INSERT INTO User (uuid, first_name, last_Name, email, password, permission_level) VALUES (UUID(),'" +
                                user.name + "','" + user.lastname + "','" + user.email + "','" + hashedPassword + "','" + user.permissionLevel + "')"
                                // result/error handling
                            db.query(sql, function(err, result) {
                                if (err) console.log(err)
                                else
                                    console.log("Number of records inserted: " + result)
                            })
                        })
                        // redirect to profile
                    res.redirect('../profile')
                        // else if user does exist, return error message
                } else {
                    res.render("signup_patient.ejs", { error: 'Email already exists' })
                        // console.log('user already exists')
                    return
                }
            })
            // catch errors, 
    } catch (err) {
        // catch error and return
        res.render("signup_patient.ejs", { error: err })

    }

})


module.exports = router