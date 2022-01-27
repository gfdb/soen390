const express = require('express')
const router = express()
const db = require('../database')


router.use(express.urlencoded({ extended: false }))

router.get('/', (req, res) => {
    res.render('signup.ejs')

})

router.post('/', (req, res) => {
    const { name, lName, email, pwd, cPwd } = req.body
    console.log(name + " " + lName + " " + email + " " + pwd + " " + cPwd)
    res.render('signup.ejs')

})


module.exports = router