//routes for login page
const express = require('express')
const router = express.Router()

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