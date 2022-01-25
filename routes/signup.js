const express = require('express')
const router = express()

router.get('/', (req, res) => {
    res.render('signup.ejs')

})

router.post('/', (req, res) => {

})


module.exports = router