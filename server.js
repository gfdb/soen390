//importring evrironment variable
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

//importing
const express = require("express")
const app = express()
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const initializePassport = require('./passport-config')

initializePassport(
    passport,
    email => user.email,
    id => user.id
)

// Static Files
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/img', express.static(__dirname + 'public/img'))

//setting up ejs 
app.set('views', './views');
app.set('view engine', 'ejs')
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())



//path for home
app.get('/', (req, res) => {
    // console.log('home')
    // res.sendStatus(500)
    // res.status(500).send('crash')or.json({message:error})
    // res.send('test')
    res.render('index.ejs')
})

//logout
app.post('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
})

//importing routers
const signupRouter = require('./routes/signup')
app.use('/signup', CheckNotAuthenticated, signupRouter)

const profileRouter = require('./routes/profile')
app.use('/profile', checkAuthenticated, profileRouter)

const loginRouter = require('./routes/login')
    // const res = require('express/lib/response')
app.use('/login', CheckNotAuthenticated, loginRouter)

//sesion middleware
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

function CheckNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/profile')
    }
    next()
}
//server start on port 3000
var app_server = app.listen(3000)

console.log('listening on 3000...http://localhost:3000')

// for tests
module.exports = {
    app: app,
    app_server: app_server,
}