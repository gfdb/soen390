//routes for login page
const express = require('express')
const router = express.Router()
const db = require('../database')

// login post 
router.post('/', (req, res) => {
    try {
        db.query('SELECT * FROM User WHERE User.email = \'' + req.body.email + '\'', async(err, user) => {
            if (err) console.log(err)
            if (user.length == 0) throw new Error('User doesn\'t exist')

            await bcrypt.compare(req.body.password, user.password)


        })



    } catch (err) {

    }
})

// login 
router.get('/', (req, res) => {
    res.render('login_patient.ejs', {
        err_msg: req.session.messages
    })


})

module.exports = router