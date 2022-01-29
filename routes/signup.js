const express = require('express')
const router = express()
const bcrypt = require('bcrypt')
const db = require('../database')


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

router.post('/', async(req, res) => {
    const { name, lName, email, pwd, cPwd } = req.body
    console.log(name + " " + lName + " " + email + " " + pwd + " " + cPwd)

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

    } catch {

    }

})


module.exports = router