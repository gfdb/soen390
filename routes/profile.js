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
    try {
        var sql = 'Update User, Address SET User.first_name = \'' + req.body.firstName + '\', User.last_name = \'' +
            req.body.lastName + '\', User.email= \'' + req.body.email + '\', Address.street_name = \'' +
            req.body.address + '\', Address.apartment_number = \'' + req.body.appartment + '\', Address.city = \'' + req.body.city + '\', Address.province = \'' +
            req.body.province + '\', Address.zipcode = \'' + req.body.zip + '\' WHERE User.uuid = \'' + req.session.user.uuid + '\' AND Address.uuid = \'' + req.session.address.uuid + '\''
        db.query(sql, (err, result) => {
            try {
                if (err) throw new Error(err)
                    // console.log(result[0])
                console.log(req.session.address)

                //updating user in session
                req.session.user.name = req.body.firstName
                req.session.user.lastname = req.body.lastName
                req.session.user.email = req.body.email

                //updating address in session
                req.session.address.street_name = req.body.address
                req.session.address.apartment_number = req.body.appartment
                req.session.address.city = req.body.city
                req.session.address.province = req.body.province
                req.session.address.zip = req.body.zip

                req.session.save()



                // console.log("updated: " + result[0])

            } catch (err) {
                console.log(err, '1')

            }

        })
    } catch (err) {
        console.log(err, '2')
    }
    res.status(200).redirect('/profile')

})

module.exports = router