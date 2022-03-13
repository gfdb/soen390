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

// app.set('trustproxy', true)

// Static Files
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/img', express.static(__dirname + 'public/img'))



//setting up ejs 
app.set('views', './views');
app.set('view engine', 'ejs')

// const session = require('./routes/login')
app.use(session({
        secret: '123',
        cookie: { maxAge: 30000000000000 },
        resave: false,
        saveUninitialized: false
    }))
    // middleware
    // app.use(express.urlencoded({ extended: true }));

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

const messagingRouter = require('./routes/messaging')
app.use('/messaging', checkAuthenticated, messagingRouter)

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
app.get('/doctorsPatientList', checkAuthenticated, (req, res) => {



    var positivepatientList = []
    var negativepatientList = []

    //Queries for the list of workers that have yet to be approved by the admin

    var sql = "Select User.first_name, User.last_name, User.permission_level,Patient.covid,User.uuid FROM User,Patient Where User.uuid = Patient.user_uuid AND Patient.doctor_uuid = '" + req.session.user.uuid + "' AND permission_level = 'patient';";
    db.query(sql, function(err, result) {
        if (err) console.log(err)

        for (let i = 0; i < result.length; i++) {

            covid = result[i].covid

            //Sorts users based on role
            switch (covid) {
                case 1:
                    positivepatientList.push(result[i])
                    break;
                case 0:
                    negativepatientList.push(result[i])
                    break;
                    // case "health official":
                    //   healthOffList.push(result[i])
                    // break;
                    // case "immigration officer":
                    //   immigrationOffList.push(result[i])
                    // break;
                default:
                    throw "Error: No patient found when retrieving assigned patients for this doctor!"
            }
        }
        res.render('doctors_patient_list.ejs', { positivepatients: positivepatientList, negativepatients: negativepatientList })
    })
})


app.post('/doctorsPatientProfile', function(req, res) {
    var user_uuid = req.body.uuid
    var patientinfo = []
        //Queries for the list of workers that have yet to be approved by the admin
    var sql = "Select User.first_name, User.last_name, User.email,Patient.covid,Patient.symptoms,User.uuid FROM User,Patient Where User.uuid = '" + user_uuid + "' AND Patient.doctor_uuid = '" + req.session.user.uuid + "' AND permission_level = 'patient' AND User.uuid = Patient.user_uuid;";
    db.query(sql, function(err, result) {
        if (err) console.log(err)

        //  if (result.length==0)
        // {
        //  throw "Error: No patient found when retrieving assigned patients for this doctor!"
        // }
        // else
        // {


        for (let i = 0; i < 1; i++) {

            // covid = result[i].covid

            //Sorts users based on role

            patientinfo.push(result[i])


            // case "health official":
            //   healthOffList.push(result[i])
            // break;
            // case "immigration officer":
            //   immigrationOffList.push(result[i])
            // break;

            //}   
        }

        res.render('doctors_patient_profile.ejs', { patientinfo: patientinfo })
    })
})




//Approves a worker and changes their verification status from 0 to 1 in the database
app.post('/changeCovidStatus', function(req, res) {
    var user_uuid = req.body.uuid
    var covid = req.body.covid
        //console.log(user_uuid);
        //console.log(covid);
    if (covid == 1) {
        db.connect(function(err) {
            if (err) throw err;
            var sql = "UPDATE Patient SET covid = " + 0 + " WHERE (user_uuid = '" + user_uuid + "');";
            db.query(sql, function(err, result) {
                if (err) throw err;
                console.log("SET TO 0");
            });
        });
        res.redirect('./doctorsPatientList')
    } else {
        db.connect(function(err) {
            if (err) throw err;
            var sql = "UPDATE Patient SET covid = " + 1 + " WHERE (user_uuid  = '" + user_uuid + "');";
            db.query(sql, function(err, result) {
                if (err) throw err;
                console.log("SET TO 1");
            });
        });
        res.status(200).redirect('./doctorsPatientList')
    }
})
app.post('/doctorMessaging', function(req, res) {
    patient_uuid = req.body.uuid
    doctor_uuid = req.session.user.uuid
    console.log(patient_uuid)
    console.log(doctor_uuid)
    var messageList = []

    //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx


    let date_ob = new Date();

    // current date
    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();

    // current hours
    let hours = date_ob.getHours();

    // current minutes
    let minutes = date_ob.getMinutes();

    // current seconds
    let seconds = date_ob.getSeconds();

   
    
    // console.log(req.body.messageList)
    // console.log(doctor_uuid)
    // console.log(patient_uuid)
    // console.log(message)
    // console.log(patientFirstName)

    if (req.body.check)
    {
    db.connect(function(err) {
        if (err) throw err;
        patient_uuid = req.body.uuid
        doctor_uuid = req.session.user.uuid
        message = req.body.doctormessage
        
        
        console.log(messageList[0])
        var sql = "INSERT INTO Messages  VALUES ('"+doctor_uuid+"','"+patient_uuid+"','"+message+"','"+year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds+"')";
        db.query(sql, function(err, result) {
            if (err) throw err;
           
        
        
    });})}


    //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx






    //console.log(patient_uuid)
    

    //Queries for the list of workers that have yet to be approved by the admin


    //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

    var sql = "SELECT * FROM ( SELECT message.sender_uuid,message.receiver_uuid,message.message,message.first_name as senderFirstName,message.last_name AS senderLastName, message.date_time,receiver.first_name AS receiverFirstName, receiver.last_name AS receiverLastName FROM "+


    " (Select sender_uuid,receiver_uuid,message,date_time,User.first_name,User.last_name from Messages,User WHERE sender_uuid = '"+doctor_uuid+"' AND receiver_uuid = '"+patient_uuid+"' AND sender_uuid = User.uuid ORDER BY date_time DESC) As message, "+
   
    " (SELECT User.first_name,User.last_name,User.uuid FROM User WHERE User.uuid = '"+patient_uuid+"') AS receiver " +
    
   " WHERE message.receiver_uuid = receiver.uuid "+
    
" UNION " + 
"SELECT message.sender_uuid,message.receiver_uuid,message.message,message.first_name as senderFirstName,message.last_name AS senderLastName, message.date_time,receiver.first_name AS receiverFirstName, receiver.last_name AS receiverLastName FROM "+


  "  (Select sender_uuid,receiver_uuid,message,date_time,User.first_name,User.last_name from Messages,User WHERE sender_uuid = '"+patient_uuid+"' AND receiver_uuid = '"+doctor_uuid+"' AND sender_uuid = User.uuid ORDER BY date_time DESC) As message, "+
   
  "   (SELECT User.first_name,User.last_name,User.uuid FROM User WHERE User.uuid = '"+doctor_uuid+"') AS receiver " +
    
  "  WHERE message.receiver_uuid = receiver.uuid ) X ORDER BY X.date_time ASC";
     //console.log(sql);
    db.query(sql, function(err, result) {
        if (err) console.log(err)
        patient_uuid = req.body.uuid
        doctor_uuid = req.session.user.uuid
        doctorFirstName = ""
        doctorLastName =""
        patientFirstName = ""
        patientLastName = ""
       

        if (result.length == 0)
        {
            console.log("I am inside empty message")
            console.log(doctor_uuid)
            console.log(patient_uuid)
            var sql2 = "SELECT User.first_name,User.last_name FROM User WHERE User.uuid = '"+patient_uuid+"';"
            db.query(sql2, function(err, result1) {
                if (err) console.log(err)
                patient_uuid = req.body.uuid
                doctor_uuid = req.session.user.uuid
                console.log(result1)
               
                patientFirstName = result1[0].first_name
                patientLastName = result1[0].last_name
            
                res.render('doctor_messaging.ejs',{ doctor_uuid: doctor_uuid,patient_uuid: patient_uuid,patientFirstName:patientFirstName,patientLastName:patientLastName,messageList:messageList })
                
            })
        }
        else
        {
         if (doctor_uuid == result[0].sender_uuid)
        {
            doctorFirstName = result[0].senderFirstName
            doctorLastName = result[0].senderLastName
            patientFirstName = result[0].receiverFirstName
            patientLastName = result[0].receiverLastName
        }
        else if (patient_uuid == result[0].sender_uuid)
        {
            doctorFirstName = result[0].receiverFirstName
            doctorLastName = result[0].receiverLastName
            patientFirstName = result[0].senderFirstName
            patientLastName = result[0].senderLastName
        }
        
        for (let i = 0; i < result.length; i++) {

           
                    messageList.push(result[i])
                    
            }
           
           res.render('doctor_messaging.ejs',{ doctor_uuid: doctor_uuid,patient_uuid: patient_uuid,patientFirstName:patientFirstName,patientLastName:patientLastName,messageList:messageList })
        }
    })
    
   
 
   
    
})

app.post('/sendMessage', function(req, res) {
    let date_ob = new Date();

    // current date
    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();

    // current hours
    let hours = date_ob.getHours();

    // current minutes
    let minutes = date_ob.getMinutes();

    // current seconds
    let seconds = date_ob.getSeconds();

   
    
    // console.log(req.body.messageList)
    // console.log(doctor_uuid)
    // console.log(patient_uuid)
    // console.log(message)
    // console.log(patientFirstName)
    db.connect(function(err) {
        if (err) throw err;
        patient_uuid = req.body.patientuuid
        doctor_uuid = req.session.user.uuid
        message = req.body.doctormessage
        patientFirstName = req.body.patientFirstName
        patientLastName = req.body.patientLastName
        messageList = req.body.messageList
        console.log(messageList[0])
        var sql = "INSERT INTO Messages  VALUES ('"+doctor_uuid+"','"+patient_uuid+"','"+message+"','"+year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds+"')";
        db.query(sql, function(err, result) {
            if (err) throw err;
           
        
        res.redirect('/doctorMessaging')
    });
    });
    
})


app.get('/patientMessaging', function(req, res) {
    res.render('patient_messaging.ejs')
})

//server start on port 3000
var app_server = app.listen(3000)
console.log('listening on 3000...http://localhost:3000')







// export variables to be used elsewhere
module.exports = {
    app: app,
    app_server: app_server
}