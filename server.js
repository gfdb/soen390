//importring evrironment variable
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

//importing
const express = require("express")
const app = express()

app.use(express.urlencoded({ extended: false }))

//initializing db 
const db = require('./database')

const session = require('express-session')



// Static Files
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/img', express.static(__dirname + 'public/img'))



//setting up ejs 
app.set('views', './views');
app.set('view engine', 'ejs')
app.use(session({
    secret: '123',
    cookie: { maxAge: 30000 },
    resave: false,
    saveUninitialized: false
}))

// middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));




// session config
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}));


//path for home
app.get('/', (req, res) => {
    res.render('index.ejs')
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
app.use('/signup', signupRouter)

// profile
const profileRouter = require('./routes/profile')
app.use('/profile', profileRouter)

// login
const loginRouter = require('./routes/login')
app.use('/login', loginRouter)

//sesion middleware functions
// check if authenticated


// check if not authenticated


// check if admin
function checkAdmin(req, res, next) {
    if (eq.isAuthenticated() && (req.user.permissionLevel.localeCompare('admin') === 0)) {
        return next()
    }
    res.redirect('/')
}

//added newly from front-end- probably need fixes on the backend
app.get('/approveRoles', (req, res) => {
    var doctorList = []
    var nurseList = []
    var healthOffList = []
    var immigrationOffList = []
        //Queries for the list of workers that have yet to be approved by the admin
    db.connect((err) => {
        if (err) console.log(err)
        console.log("Connected!")
        var sql = "SELECT Worker.role, User.first_name, User.last_name, Worker.user_uuid, User.email  FROM Worker, User WHERE Worker.user_uuid = User.uuid AND verified = 0";
        db.query(sql, function(err, result) {
            if (err) console.log(err)

            for (let i = 0; i < result.length; i++) {

                role = result[i].role
                    //Sorts users based on role
                switch (role) {
                    case "doctor":
                        doctorList.push(result[i])
                        break;
                    case "nurse":
                        nurseList.push(result[i])
                        break;
                    case "health official":
                        healthOffList.push(result[i])
                        break;
                    case "immigration officer":
                        immigrationOffList.push(result[i])
                        break;
                    default:
                        throw "Error: No role found when retrieving worker!"
                }
            }
            res.render('approve_roles.ejs', { doctors: doctorList, nurses: nurseList, healthOfficials: healthOffList, immigrationOfficers: immigrationOffList })
        })
    })


})

//Approves a worker and changes their verification status from 0 to 1 in the database
app.post('/verifyWorker', function(req, res) {
    var user_uuid = req.body.uuid
    db.connect(function(err) {
        if (err) throw err;
        var sql = "UPDATE Worker SET verified =  1  WHERE ( user_uuid  =  " + user_uuid + " );";
        db.query(sql, function(err, result) {
            if (err) throw err;
            console.log(result);
        });
    });
    res.redirect('./approveRoles/')
})

//Denies a worker and removes them from the Worker table in the database, thus removing their application
app.post('/denyWorker', function(req, res) {
    var user_uuid = req.body.uuid
    db.connect(function(err) {
        if (err) throw err;
        var sql = "DELETE FROM Worker WHERE ( user_uuid  =  " + user_uuid + " );";
        db.query(sql, function(err, result) {
            if (err) throw err;
            console.log(result);
        });
    });
    res.redirect('./approveRoles/')
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

// export variables to be used elsewhere
module.exports = {
    app: app,
    app_server: app_server
}