//routes for login page
const express = require('express')
const router = express.Router()
const db = require('../database')
const User = require('../models/user')
const session = require('express-session')
const store = new session.MemoryStore()
const bcrypt = require('bcrypt')


router.use(session({
    secret: '123',
    cookie: { maxAge: 30000 },
    store,
    resave: false,
    saveUninitialized: false
}))

// login post 
router.post('/', (req, res) => {
    try {
        db.query('SELECT * FROM User WHERE User.email = \'' + req.body.email + '\'', async(err, rows) => {
            try {
                if (err) console.log(err)
                if (rows.length == 0) throw new Error('User doesn\'t exist')
                console.log(rows[0])

                await bcrypt.compare(req.body.password, rows[0].password)

                const user = new User(rows[0].uuid, rows[0].first_name, rows[0].last_name, rows[0].email, rows[0].permission_level)

                req.session.authenticated = true
                req.session.user = user

                console.log(req.session.user)
                res.status(200).redirect('/profile')
            } catch (err) {
                res.status(403).render("login_patient.ejs", { error: 'Invalid Credentials' })
            }
        })
    } catch (err) {
        //some error
        res.status(403).render("login_patient.ejs", { error: err })

    }
})

// login 
router.get('/', (req, res) => {
    res.render('login_patient.ejs', {
        error: ''
    })


})

module.exports = router