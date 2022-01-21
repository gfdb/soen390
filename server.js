//intilaizing express
const express = require("express")
const app = express()

//setting up ejs 
app.set("view engine", "ejs")

//path for home
app.get('/', (req, res) => {
    // console.log('home')
    // res.sendStatus(500)
    // res.status(500).send('crash')or.json({message:error})
    // res.send('test')
    res.render('index.ejs', { text: 'world' })
})

//setting up login routers
const loginRouter = require('./routes/login')
app.use('/login', loginRouter)

//server start on port 300
app.listen(3000)
console.log('listening on 3000...http://localhost:3000')