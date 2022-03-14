//routes for login page
const express = require('express')
const router = express.Router()
const db = require('../database')
const User = require('../models/user')
const Address = require('../models/address')
const session = require('express-session')
const store = new session.MemoryStore()
const bcrypt = require('bcrypt')


router.use(session({
    secret: '123',
    cookie: { maxAge: 30000000000000 },
    store: store,
    resave: true,
    saveUninitialized: false
}))

// login post 
router.post('/', (req, res) => {
    try {
        db.query('SELECT * FROM User,Address WHERE User.email = \'' + req.body.email + '\' AND User.uuid=Address.uuid', async(err, rows) => {
            try {

                if (err) console.log(err)
                if (rows.length == 0) throw new Error()
                    // console.log(rows[0])

                if (!await bcrypt.compare(req.body.password, rows[0].password)) throw new Error()

                const user = new User(rows[0].uuid, rows[0].first_name, rows[0].last_name, rows[0].email, rows[0].permission_level)
                const address = new Address(rows[0].uuid, rows[0].street_number, rows[0].street_name, rows[0].apartment_number, rows[0].city, rows[0].province, rows[0].zipcode)
                req.session.authenticated = true
                req.session.user = user
                req.session.address = address


                // console.log(req.session.address)
                req.session.save(() => { res.status(200).redirect('/profile') })
            } catch {
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