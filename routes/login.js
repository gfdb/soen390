//routes for login page
const express = require('express')
const router = express.Router()
const passport = require('passport')

// login post 
router.post('/',
    // login handler
    passport.authenticate('local', { failureRedirect: '/login', failureMessage: true }),
    function(req, res) {
        // if admin
        if (req.user.permissionLevel.localeCompare('admin') === 0){
            console.log('admin')
            res.redirect('/admin');
        }
        // if patient
        if (req.user.permissionLevel.localeCompare('patient') === 0) {
            console.log('patient')
            res.redirect('/profile')
        }
        // if doctor
        if (req.user.permissionLevel.localeCompare('doctor') === 0) {
            console.log('doctor')
            res.redirect('/profile')
        }
        // else
        if (!req.user) {
            console.log('other')
        }
    })

// login 
router.get('/', (req, res) => {
    res.render('login_patient.ejs', {
        err_msg: req.session.messages
    })


})

module.exports = router