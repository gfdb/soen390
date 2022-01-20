const express = require("express")
const app = express()

//path for home
app.get('/', (req, res) => {
    // console.log('home')
    // res.sendStatus(500)
    // res.status(500).send('crash')
    res.send('test')
})

//server start on port 300
app.listen(3000)
console.log('listening on 3000...http://localhost:3000')