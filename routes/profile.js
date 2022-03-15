const express = require('express')
const router = express()
const db = require('../database')

// profile
router.get('/', (req, res) => {

    res.render('profile.ejs', { user: req.session.user, address: req.session.address, patient: req.session.patient })

})

// edit profile
router.get('/edit', (req, res) => {
    res.render('edit-profile.ejs', { user: req.session.user, address: req.session.address, patient: req.session.patient })
})

router.post('/edit', (req, res) => {
    try {
        //query to update user, address and patient info of user with the form info
        var sql = 'Update User, Address, Patient SET User.first_name = \'' + req.body.firstName + '\', User.last_name = \'' +
            req.body.lastName + '\', User.email= \'' + req.body.email + '\', Address.street_name = \'' +
            req.body.address + '\', Address.apartment_number = \'' + req.body.appartment + '\', Address.city = \'' + req.body.city + '\', Address.province = \'' +
            req.body.province + '\', Address.zipcode = \'' + req.body.zip + '\' , Patient.symptoms = \'' + req.body.symptoms 
            + '\' , Patient.diary = \'' + req.body.diary + '\'  WHERE User.uuid = \'' + req.session.user.uuid + '\' AND Address.uuid = \'' + req.session.address.uuid 
            + '\' AND Patient.user_uuid = \'' + req.session.user.uuid + '\' '
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

                //updating patient in session
                req.session.patient.symptoms = req.body.symptoms
                req.session.patient.diary = req.body.diary

                
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