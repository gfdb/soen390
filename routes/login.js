//routes for login page
const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const db = require('../database')
const passport = require('passport')



router.get("/", (req, res) => {
    res.render('login_choice.ejs')
})

router.post('/patient', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/patient',
    failureFlash: true
}))

// router.post("/patient/", (req, res) => {
//     // if (username != req.body.email) {
//     //     return res.status(401).send("Invalid username")
//     // }
//     try {
//         if (bcrypt.compareSync(req.body.password, password)) {
//             //res.status(200).send('Sucessfull login')
//             res.redirect("../profile")
//         } else {
//             throw new Error('email or password are invalid')
//         }

//         // if (plain_password == req.body.password) {
//         //     c //res.status(400).send('Incorrect Password!')
//         // } else {
//         //     res.status(401).send('Incorrect Password!')
//         //         //res.redirect("/profile")
//         // }
//     } catch (err) {
//         console.error(err)
//             //res.status(401).send('Invalid username or password')
//         res.redirect('./patient')
//     }
// })

router.get('/', (req, res) => {
    res.render('login_choice.ejs')

})

router.get('/patient/', (req, res) => {
    res.render('login_patient.ejs')

})

router.get('/worker/', (req, res) => {
    res.render('login_worker.ejs')
})
module.exports = router