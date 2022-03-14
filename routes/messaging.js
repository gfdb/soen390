const express = require('express')
const router = express()
const bcrypt = require('bcrypt')
const db = require('../database')

router.get('/', (req, res) => {
    res.status(200).render("doctor_messaging.ejs", {})


})

module.exports = router