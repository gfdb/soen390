//routes for login page
const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const db = require('../database')

//TEMPORARY LOGIN STUFF###################################################################################################
const username = "John@gmail.com"
const password = bcrypt.hash("1234", 10)
const plain_password = "1234"
router.use(express.urlencoded({ extended: false }))
    //########################################################################################################################

//TEMPORARY LOGIN STUFF###################################################################################################
router.get("/", (req, res) => {
    res.render('login_choice.ejs')
})

router.post("/patient/", (req, res) => {
    if (username != req.body.email) {
        return res.status(400).send("Invalid username")
    }
    try {
        const password_check = bcrypt.compare(req.body.password, password)
        if (plain_password == req.body.password) {
            res.redirect("../profile")
                //res.status(400).send('Incorrect Password!')
        } else {
            res.status(400).send('Incorrect Password!')
                //res.redirect("/profile")
        }
    } catch {
        res.redirect('./patient')
        res.status(500).send()
    }
})

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