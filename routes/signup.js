const express = require('express')
const router = express()

router.use(express.urlencoded({ extended: false }))

router.get('/', (req, res) => {
    res.render('signup.ejs')

})

router.post('/', (req, res) => {
    console.log(req.body.email + req.body.pwd)
})


module.exports = router