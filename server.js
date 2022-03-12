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
app.use(express.urlencoded({ extended: true }));

function checkAuthenticated(req, res, next) {
    if (req.session.authenticated) {
        return next()
    }
    res.status(200).redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.session.authenticated) {
        return res.status(200).redirect('/profile')
    }
    next()
}

// session config
// app.use(session({
//     secret: 'secret',
//     resave: true,
//     saveUninitialized: true,
// }));


//path for home
app.get('/', (req, res) => {
    res.render('index.ejs', { authenticated: req.session.authenticated })
})

//logout
app.get('/logout', (req, res) => {
    req.session.destroy()
        // req.logout()
    res.redirect('/')
})

// importing routers
// signup
const signupRouter = require('./routes/signup')
app.use('/signup', checkNotAuthenticated, signupRouter)

// profile
const profileRouter = require('./routes/profile')
app.use('/profile', checkAuthenticated, profileRouter)

// login
const loginRouter = require('./routes/login')
app.use('/login', checkNotAuthenticated, loginRouter)

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
    try {
        db.query("SELECT * FROM User WHERE (permission_level = 'patient'OR permission_level='doctor') AND User.uuid NOT IN (SELECT Patient.user_uuid FROM Patient)", (err, result) => {
            if (err) throw new Error()
            try {
                let patients = []
                let doctors = []
                let doctorCount = 0
                let patientCount = 0
                for (let i = 0; i < result.length; i++) {
                    if (result[i].permission_level == 'patient') {
                        patients[patientCount] = result[i]
                        patientCount++
                    } else {
                        doctors[doctorCount] = result[i]
                        doctorCount++
                    }
                }
                // console.log(result)
                // console.log(doctors)
                // console.log(patients)
                res.status(200).render("patients_assign.ejs", { patients: patients, doctors: doctors })

            } catch {
                res.status(403).render("patients_assign.ejs", { error: err })
            }
        })
    } catch (err) {
        res.status(403).render("patients_assign.ejs", { error: err })
    }
})

app.post('/patientsAssign', (req, res) => {
    // console.log(req.body.fname)
    // console.log(req.body.lname)
    // console.log(req.body.doctor)
    // console.log(req.body.patient_uuid)


    const sql = "INSERT INTO Patient (user_uuid, doctor_uuid) VALUES ('" +
        req.body.patient_uuid + "','" +
        req.body.doctor + "')"

    db.query(sql, (err, result) => {
        if (err) console.log(err)
        else
            console.log(result[0])
    })
    res.status(200).redirect('/patientsAssign')



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