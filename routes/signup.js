const express = require('express')
const router = express()
const db = require('../database')


router.use(express.urlencoded({ extended: false }))

router.get('/', (req, res) => {
    res.render('signup.ejs')

})

router.post('/', (req, res) => {
    const { email, pwd } = req.body
    console.log(email + " " + pwd)
})


module.exports = router