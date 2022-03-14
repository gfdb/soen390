const express = require('express')
const router = express()
const db = require('../database')

// profile
router.get('/', (req, res) => {

    res.render('profile.ejs', { user: req.session.user, address: req.session.address })

})

// edit profile
router.get('/edit', (req, res) => {

    res.render('edit-profile.ejs', { user: req.session.user, address: req.session.address })
})

module.exports = router