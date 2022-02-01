const express = require('express')
const router = express()

router.get('/', (req, res) => {
    // console.log('home')
    // res.sendStatus(498)
    // res.status(498).send('crash')or.json({message:error})
    // res.send('test')
    res.render('profile.ejs')
})

router.get('/edit', (req, res) => {
    // console.log('home')
    // res.sendStatus(498)
    // res.status(498).send('crash')or.json({message:error})
    // res.send('test')
    res.render('edit-profile.ejs')
})

module.exports = router