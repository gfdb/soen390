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

router.post('/edit', (req, res) => {
    var sql = "INSERT INTO User (uuid, first_name, last_Name, email, password, permission_level) VALUES (UUID(),'" +
        user.name + "','" + user.lastname + "','" + user.email + "','" + hashedPassword + "','" + user.permissionLevel + "')"
        // result/error handling
    db.query(sql, function(err, result) {
        if (err) console.log(err)
        else
            console.log("Number of records inserted: " + result)
    })

})

module.exports = router