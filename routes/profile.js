const express = require('express')
const router = express()

// profile
router.get('/', (req, res) => {
    res.render('profile.ejs')
})

// edit profile
router.get('/edit', (req, res) => {
    res.render('edit-profile.ejs')
})

module.exports = router