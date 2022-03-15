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


                    // if no error, insert User model into the database
                    const sqlUser = "INSERT INTO User (uuid, first_name, last_Name, email, password, permission_level) VALUES (UUID(),'" +
                        user.name + "','" + user.lastname + "','" + user.email + "','" + hashedPassword + "','" + user.permissionLevel + "')"
                        // result/error handling
                    db.query(sqlUser, (err, result) => {
                        if (err) console.log(err)
                        else
                            console.log("Number of records inserted: " + result)
                    })
                    db.query("SELECT uuid FROM User WHERE email = '" + user.email + "'", function(err, result, field) {
                            //query to insert form info into address table
                            const sqlAddress = "INSERT INTO Address (uuid, street_number,street_name , apartment_number, city, province, country, zipcode) VALUES ('" + result[0].uuid + "','" +
                                null + "','" + req.body.address + "','" + req.body.address2 + "','" + req.body.city + "','" + req.body.province + "','" + null + "','" + req.body.zip + "')"
                            db.query(sqlAddress, (err, result) => {
                                if (err) console.log(err)
                                else
                                    console.log("Number of records inserted: " + result)
                            })
                            
                            //if the patient role is selected, create a patient object in database
                            if(req.body.permissionLevel === 'patient'){
                                
                                //query to insert patient info into patient table
                                const sqlPatient = "INSERT INTO Patient (user_uuid, covid, symptoms, diary) Values ('"
                                + result[0].uuid +"','" + 0 + "','" + "add via edit profile" + "','" + "add via edit profile" + "')"

                                //run the query
                                db.query(sqlPatient, (err, result) => {
                                    if (err) console.log(err)
                                    else
                                        console.log("Number of records inserted: " + result)
                                })
                                
                            }
                            
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