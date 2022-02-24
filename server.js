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
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

// initializePassport(
//     passport,
//     email => user.email,
//     id => user.id
// )

// Static Files
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/img', express.static(__dirname + 'public/img'))




//setting up ejs 
app.set('views', './views');
app.set('view engine', 'ejs')
app.use(flash())
app.use(session({
    secret: '123',
    resave: false,
    saveUninitialized: false
}))

// middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// cookie parser
app.use(cookieParser('secret'));
// body-parser 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
passport.serializeUser(function(user, done) {
    // only works with strings
    done(null, toString(user.id));
});

passport.deserializeUser(function(id, done) {
    // only works with strings
    done(null, toString(id));
});
// session config
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}));
// initialize passport
app.use(passport.initialize())
    // 
app.use(passport.session())


//path for home
app.get('/', (req, res) => {
    res.render('index.ejs', {
        isLoggedIn: req.isAuthenticated()
    })
})

//logout
app.get('/logout', (req, res) => {
    req.session.destroy()
    req.logout()
    res.redirect('/')
})

// importing routers
// signup
const signupRouter = require('./routes/signup')
app.use('/signup', CheckNotAuthenticated, signupRouter)

// profile
const profileRouter = require('./routes/profile')
app.use('/profile', checkAuthenticated, profileRouter)

// login
const loginRouter = require('./routes/login')
app.use('/login', CheckNotAuthenticated, loginRouter)

//sesion middleware functions
// check if authenticated
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

// check if not authenticated
function CheckNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/profile')
    }
    next()
}

// check if admin
function checkAdmin(req, res, next) {
    if (eq.isAuthenticated() && (req.user.permissionLevel.localeCompare('admin') === 0)) {
        return next()
    }
    res.redirect('/')
}

//added newly from front-end- probably need fixes on the backend
app.get('/approveRoles', (req, res) => {
    res.render('approve_roles.ejs')
})

app.get('/doctorMonitor', (req, res) => {
    res.render('doctor_monitor.ejs')
})

app.get('/assignedPatients', (req, res) => {
    res.render('assigned_patients.ejs')
})

app.get('/adminIndex', (req, res) => {
    res.render('admin_index.ejs')
})

app.get('/patientsAssign', (req, res) => {
    res.render('patients_assign.ejs')
})

app.get('/selectDoctor', (req, res) => {
    res.render('select_doctor.ejs')
})


//server start on port 3000
var app_server = app.listen(3000)
console.log('listening on 3000...http://localhost:3000')

<<<<<<< HEAD
=======

>>>>>>> f3b9bbb8d6216a8854267dc36df16b263e285324
// export variables to be used elsewhere
module.exports = {
    app: app,
    app_server: app_server,
}