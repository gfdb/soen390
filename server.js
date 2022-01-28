//intilaizing express
const express = require("express")
const app = express()

// Static Files
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/img', express.static(__dirname + 'public/img'));

//setting up ejs 
app.set('views', './views');
app.set('view engine', 'ejs');

//path for home
app.get('/', (req, res) => {
    // console.log('home')
    // res.sendStatus(500)
    // res.status(500).send('crash')or.json({message:error})
    // res.send('test')
    res.render('index.ejs')
})

//importing router
const signupRouter = require('./routes/signup')
app.use('/signup', signupRouter)

//server start on port 300
app.listen(3000)
console.log('listening on 3000...http://localhost:3000')