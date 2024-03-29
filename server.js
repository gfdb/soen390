//importring evrironment variable
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

//importing
const express = require("express")
const app = express()

const nodemailer = require("nodemailer")

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

//function to check if user is not authenticated
function checkAuthenticated(req, res, next) {
    if (req.session.authenticated) {
        return next()
    }
    res.status(200).redirect('/login')
}

//function to check if user is not authenticated
function checkNotAuthenticated(req, res, next) {
    if (req.session.authenticated) {
        return res.status(200).redirect('/profile')
    }
    next()
}

// check if admin
function checkAdmin(req, res, next) {
    if (req.session.authenticated && (req.session.user.permissionLevel.localeCompare('admin') === 0)) {
        return next()
    }
    res.redirect('/')
}

// check if current user is a doctor
function checkDoctor(req, res, next) {
    if (!req.session.authenticated) {
        // redirect to login if user is not logged in
        return res.status(403).redirect('/login')
    }
    // check if they are a doctor
    else if (req.session.user.permissionLevel.localeCompare('doctor') === 0)
        return next()
            // 403 forbidden if the user is not a doctor
    return res.status(403).redirect('/')
}

// check if current user is a doctor
function checkHealthOfficial(req, res, next) {
    if (!req.session.authenticated) {
        // redirect to login if user is not logged in
        return res.status(403).redirect('/login')
    }
    // check if they are a doctor
    else if (req.session.user.permissionLevel.localeCompare('health official') === 0)
        return next()
            // 403 forbidden if the user is not a doctor
    return res.status(403).redirect('/')
}

//path for home
app.get('/', (req, res) => {
    res.render('index.ejs', { authenticated: req.session.authenticated })
})

//logout
app.get('/logout', checkAuthenticated, (req, res) => {
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

//messaging
const messagingRouter = require('./routes/messaging')
app.use('/messaging', checkAuthenticated, messagingRouter)

//sesion middleware functions
// check if authenticated

//added newly from front-end- probably need fixes on the backend
app.get('/approveRoles', checkAdmin, (req, res) => {
    var doctorList = []
    var nurseList = []
    var healthOffList = []
    var immigrationOffList = []
        //Queries for the list of workers that have yet to be approved by the admin
    db.connect((err) => {
        if (err) console.log(err)
        console.log("Connected!")

        //query that selects info from worker and user based of a join on user id
        var sql = `
            SELECT Worker.role, User.first_name, User.last_name, Worker.user_uuid, User.email 
            FROM Worker, User 
            WHERE Worker.user_uuid = User.uuid 
            AND verified = 0`;
        db.query(sql, function(err, result) {
            if (err) console.log(err)

            //iterate through worker list length and sort workers by their type (nurse, doctor etc.)
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
            //render approve roles page passing to it the list of roles
            res.render('approve_roles.ejs', { doctors: doctorList, nurses: nurseList, healthOfficials: healthOffList, immigrationOfficers: immigrationOffList })
        })
    })


})

//Approves a worker and changes their verification status from 0 to 1 in the database
app.post('/verifyWorker', checkAdmin, function(req, res) {
    var user_uuid = req.body.uuid
    db.connect(function(err) {
        if (err) throw err;
        //update worker verified status in worked database, finds worker by user id
        var sql = "UPDATE Worker SET verified =  1  WHERE ( user_uuid  =  '" + user_uuid + "' );";
        db.query(sql, function(err, result) {
            if (err) throw err;
            console.log(result);
        });
    });
    res.redirect('./approveRoles/')
})

//Denies a worker and removes them from the Worker table in the database, thus removing their application
app.post('/denyWorker', checkAdmin, function(req, res) {
    var user_uuid = req.body.uuid
    db.connect(function(err) {
        if (err) throw err;
        //delete worker from database if role is denied
        var sql = "DELETE FROM Worker WHERE ( user_uuid  =  '" + user_uuid + "' );";
        db.query(sql, function(err, result) {
            if (err) throw err;
            console.log(result);
        });
    });
    res.redirect('./approveRoles/')
})

//app get requests for doctor and admin pages
app.get('/doctorMonitor', checkAdmin, (req, res) => {

    const sql = `
            SELECT * 
            FROM User
            WHERE (permission_level = 'patient' OR (permission_level='doctor' AND User.uuid IN (SELECT Worker.user_uuid
                                                                                                FROM Worker
                                                                                                WHERE Worker.verified = 1))) 
            AND User.uuid NOT IN (SELECT Doctor.patient_uuid 
                                FROM Doctor)`
    db.query(sql, (err, result) => {
        if (err) throw new Error()

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
        const countSql = `SELECT Doctor.user_uuid, COUNT(*) As count FROM Doctor GROUP BY Doctor.user_uuid`
        db.query(countSql, (err, result1) => {
            if (err) console.log(err)
                // console.log(result1, 'result1')
            for (let i = 0; i < doctors.length; i++) {
                doctors[i].count = 0
                for (let j = 0; j < result1.length; j++) {
                    if (doctors[i].uuid === result1[j].user_uuid) {
                        doctors[i].count = result1[j].count
                        continue
                    }
                    // console.log(doctors[i])
                }
            }
            res.render('doctor_monitor.ejs', { doctors: doctors })

        })
    })
})

app.get('/assignedPatients', checkAdmin, (req, res) => {
    res.render('assigned_patients.ejs')
})

app.get('/adminIndex', checkAdmin, (req, res) => {
    res.render('admin_index.ejs')
})

app.get('/patientsAssign', checkAdmin, (req, res) => {
    try {

        // select all patients who don't have a doctor 
        // and all doctors


        const sql = `
            SELECT * 
            FROM User
            WHERE (permission_level = 'patient' OR (permission_level='doctor' AND User.uuid IN (SELECT Worker.user_uuid
                                                                                                FROM Worker
                                                                                                WHERE Worker.verified = 1))) 
            AND User.uuid NOT IN (SELECT Doctor.patient_uuid 
                                FROM Doctor)`
        db.query(sql, (err, result) => {
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
                const countSql = `SELECT Doctor.user_uuid, COUNT(*) As count FROM Doctor GROUP BY Doctor.user_uuid`
                db.query(countSql, (err, result1) => {
                    if (err) console.log(err)
                        // console.log(result1, 'result1')
                    for (let i = 0; i < doctors.length; i++) {
                        doctors[i].count = 0
                        for (let j = 0; j < result1.length; j++) {
                            if (doctors[i].uuid === result1[j].user_uuid) {
                                doctors[i].count = result1[j].count
                                continue
                            }
                            // console.log(doctors[i])
                        }
                    }

                    result1.forEach(element => {
                        console.log(element)
                    })


                    res.status(200).render("patients_assign.ejs", { patients: patients, doctors: doctors })
                })
            } catch {
                res.status(403).render("patients_assign.ejs", { error: err })
            }
        })
    } catch (err) {
        res.status(403).render("patients_assign.ejs", { error: err })
    }
})

app.post('/patientsAssign', checkAdmin, (req, res) => {

    const sql = `INSERT INTO Doctor (user_uuid, patient_uuid) 
        VALUES ('${req.body.doctor}', '${req.body.patient_uuid}')`

    db.query(sql, (err, result) => {
        if (err) console.log(err)
        else
            console.log(result[0])
    })
    res.status(200).redirect('/patientsAssign')
})

app.get('/selectDoctor', checkAdmin, (req, res) => {
    res.render('select_doctor.ejs')
})

app.get('/doctorsPatientList', checkDoctor, (req, res) => {

    const doctor_uuid = req.session.user.uuid
    var positivepatientList = []
    var negativepatientList = []
    var allpatients = []
        //Queries for the list of workers that have yet to be approved by the admin
    db.query(`SELECT * FROM Patient`, (err, result) => {
        console.log(result[0])
    })


    var sql = `
        Select u1.first_name, u1.last_name, u1.email, Patient.covid, Patient.symptoms, u1.uuid, Patient.criticality
        FROM User u1, Patient
        WHERE Patient.user_uuid in (SELECT Patient.user_uuid from Doctor, Patient 
                                    WHERE Doctor.user_uuid = '${doctor_uuid}' 
                                    AND Doctor.patient_uuid = Patient.user_uuid) 
        AND Patient.user_uuid = u1.uuid order by Patient.criticality asc;`

    db.query(sql, (err, result) => {
        if (err) console.log(err)

        for (let i = 0; i < result.length; i++) {
            // console.log(result[i])
            covid = result[i].covid
            allpatients.push(result[i])
                //Sorts users based on role
            switch (covid) {
                case 1:
                    positivepatientList.push(result[i])
                    break;
                case 0:
                    negativepatientList.push(result[i])
                    break;

                default:
                    throw "Error: No patient found when retrieving assigned patients for this doctor!"
            }
        }
        res.render('doctors_patient_list.ejs', { allpatients: allpatients })
    })
})

app.get('/doctorsPatientProfile/:patient_id', checkDoctor, function(req, res) {
    // patient uuid
    const patient_uuid = req.params.patient_id

    // initialize patient list
    var patientinfo = []

    //Query for the list of patients of the logged in doctor
    var sql = `
        Select  u1.uuid ,u1.first_name, u1.last_name, u1.email, Patient.covid, Patient.symptoms,Patient.diary, Patient.criticality, Address.street_number,Address.street_name , Address.apartment_number, Address.city, Address.province, Address.country, Address.zipcode
        FROM User u1, Patient,Address
        WHERE Patient.user_uuid = '${patient_uuid}'
        AND Patient.user_uuid = u1.uuid AND Address.uuid = u1.uuid;`

    // query the database with above query
    db.query(sql, function(err, result) {
        // if error, print it
        if (err) console.log(err)

        // create list of patients returned from the query
        for (let i = 0; i < result.length; i++)
            patientinfo.push(result[i])


        res.render('doctors_patient_profile.ejs', { patientinfo: patientinfo[0] })
    })
})

app.post('/doctorsPatientProfile/:patient_id', checkDoctor, function(req, res) {
        // patient uuid
        const patient_uuid = req.params.patient_id

        // initialize patient list
        var patientinfo = []
        const sqlSeverity = `UPDATE Patient SET criticality=${req.body.severity} WHERE Patient.user_uuid='${patient_uuid}'`
            // result/error handling
        db.query(sqlSeverity, (err, result) => {
                if (err) console.log(err)
                else
                    console.log("Number of records inserted: " + result)
            })
            //Query for the list of patients of the logged in doctor
        var sql = `
        Select  u1.uuid ,u1.first_name, u1.last_name, u1.email, Patient.covid, Patient.symptoms,Patient.diary, Patient.criticality, Address.street_number,Address.street_name , Address.apartment_number, Address.city, Address.province, Address.country, Address.zipcode
        FROM User u1, Patient,Address
        WHERE Patient.user_uuid = '${patient_uuid}'
        AND Patient.user_uuid = u1.uuid AND Address.uuid = u1.uuid;`

        // query the database with above query
        db.query(sql, function(err, result) {
            // if error, print it
            if (err) console.log(err)

            // create list of patients returned from the query
            for (let i = 0; i < result.length; i++)
                patientinfo.push(result[i])


            res.render('doctors_patient_profile.ejs', { patientinfo: patientinfo[0] })
        })
    })
    // action="/signup" method="POST"



//Approves a worker and changes their verification status from 0 to 1 in the database
app.post('/changeCovidStatus', checkDoctor, function(req, res) {
    var user_uuid = req.body.uuid
    var covid = req.body.covid
        // check if status is 1, then change it to 0 and vice versa   
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

app.get('/doctorMessaging/:patient_uuid', checkDoctor, function(req, res) {
    const patient_uuid = req.params.patient_uuid
    const doctor_uuid = req.session.user.uuid

    var messageList = []

    // This query will get the list of messages that the doctor and patient engaged in ordered by time
    const sql = `
        SELECT * FROM (SELECT message.sender_uuid,message.receiver_uuid,message.message,message.first_name as senderFirstName, message.last_name AS senderLastName, message.date_time,receiver.first_name AS receiverFirstName, receiver.last_name AS receiverLastName
                    FROM (Select sender_uuid,receiver_uuid,message,date_time,User.first_name,User.last_name 
                            FROM Messages, User 
                            WHERE sender_uuid = '${doctor_uuid}' 
                            AND receiver_uuid = '${patient_uuid}' 
                            AND sender_uuid = User.uuid 
                            ORDER BY date_time DESC) As message, 
                    (SELECT User.first_name,User.last_name,User.uuid 
                        FROM User 
                        WHERE User.uuid = '${patient_uuid}') AS receiver
        WHERE message.receiver_uuid = receiver.uuid
        UNION 
        SELECT message.sender_uuid, message.receiver_uuid, message.message, message.first_name as senderFirstName, message.last_name AS senderLastName, message.date_time, receiver.first_name AS receiverFirstName, receiver.last_name AS receiverLastName 
        FROM (Select sender_uuid, receiver_uuid, message, date_time, User.first_name, User.last_name
            FROM Messages, User 
            WHERE sender_uuid = '${patient_uuid}'
            AND receiver_uuid = '${doctor_uuid}'
            AND sender_uuid = User.uuid 
            ORDER BY date_time DESC) AS message, 
            (SELECT User.first_name, User.last_name, User.uuid
            FROM User 
            WHERE User.uuid = '${doctor_uuid}') AS receiver 
        WHERE message.receiver_uuid = receiver.uuid ) X 
        ORDER BY X.date_time ASC`

    db.query(sql, function(err, result) {
        if (err) console.log(err)

        doctorFirstName = ""
        doctorLastName = ""
        patientFirstName = ""
        patientLastName = ""

        if (result.length == 0) {

            // This query will display only the patient's name when there is no previous conversation with his/her doctor
            var sql2 = "SELECT User.first_name,User.last_name FROM User WHERE User.uuid = '" + patient_uuid + "';"
            db.query(sql2, function(err, result1) {
                if (err) console.log(err)

                console.log(result1)

                patientFirstName = result1[0].first_name
                patientLastName = result1[0].last_name
                console.log("I m inside am empty message for doctor")
                console.log(patientFirstName)
                console.log(patientLastName)
                res.render('doctor_messaging.ejs', { doctor_uuid: doctor_uuid, patient_uuid: patient_uuid, patientFirstName: patientFirstName, patientLastName: patientLastName, messageList: messageList })
            })
        } else { // if doctor is sender:
            if (doctor_uuid == result[0].sender_uuid) {
                doctorFirstName = result[0].senderFirstName
                doctorLastName = result[0].senderLastName
                patientFirstName = result[0].receiverFirstName
                patientLastName = result[0].receiverLastName
            }
            // if patient is sender:
            else if (patient_uuid == result[0].sender_uuid) {
                doctorFirstName = result[0].receiverFirstName
                doctorLastName = result[0].receiverLastName
                patientFirstName = result[0].senderFirstName
                patientLastName = result[0].senderLastName
            }

            for (let i = 0; i < result.length; i++) // loop to get all the messages and their data.
            { messageList.push(result[i]) }


            res.render('doctor_messaging.ejs', { doctor_uuid: doctor_uuid, patient_uuid: patient_uuid, patientFirstName: patientFirstName, patientLastName: patientLastName, messageList: messageList })
        }
        //res.render('doctor_messaging.ejs', { doctor_uuid: doctor_uuid, patient_uuid: patient_uuid, patientFirstName: patientFirstName, patientLastName: patientLastName, messageList: messageList })
        console.log("after sedning message")

    })

})

app.post('/doctorMessaging/:patient_uuid', checkDoctor, function(req, res) {

    db.connect(function(err) {
        if (err) throw err;
        patient_uuid = req.params.patient_uuid
        doctor_uuid = req.session.user.uuid
        message = req.body.doctormessage
        console.log(patient_uuid)

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
        // This query will insert the message that the doctor sent to the Messages table in the database
        var sql = "INSERT INTO Messages  VALUES ('" + doctor_uuid + "','" + patient_uuid + "','" + message + "','" + year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds + "')";
        db.query(sql, function(err, result) {
            if (err) throw err;

            res.status(200).redirect(req.originalUrl)

        });
    })

})



app.get('/patientMessaging', checkAuthenticated, function(req, res) {
    const patient_uuid = req.session.user.uuid

    db.connect(function(err) {
        // This query will check if the patient is assigned to a doctor. if yes, he/she will be able to message the doctor.
        var sql = `SELECT Doctor.user_uuid FROM Doctor WhERE Doctor.patient_uuid = '${patient_uuid}'`
        db.query(sql, function(err, result) {
            if (err) throw err;

            if (result.length == 0) {
                res.redirect('/profile')
            } else {
                const doctor_uuid = result[0].user_uuid
                var messageList = []



                // This query will get the list of messages that the doctor and patient engaged in ordered by time
                var sql = `
            SELECT * FROM (SELECT message.sender_uuid,message.receiver_uuid,message.message,message.first_name as senderFirstName, message.last_name AS senderLastName, message.date_time,receiver.first_name AS receiverFirstName, receiver.last_name AS receiverLastName
                        FROM (Select sender_uuid,receiver_uuid,message,date_time,User.first_name,User.last_name 
                                FROM Messages, User 
                                WHERE sender_uuid = '${patient_uuid}'
                                AND receiver_uuid = '${doctor_uuid}' 
                                AND sender_uuid = User.uuid 
                                ORDER BY date_time DESC) As message, 
                        (SELECT User.first_name,User.last_name,User.uuid 
                            FROM User 
                            WHERE User.uuid = '${doctor_uuid}') AS receiver
            WHERE message.receiver_uuid = receiver.uuid
            UNION 
            SELECT message.sender_uuid, message.receiver_uuid, message.message, message.first_name as senderFirstName, message.last_name AS senderLastName, message.date_time, receiver.first_name AS receiverFirstName, receiver.last_name AS receiverLastName 
            FROM (Select sender_uuid, receiver_uuid, message, date_time, User.first_name, User.last_name
                FROM Messages, User 
                WHERE sender_uuid = '${doctor_uuid}'
                AND receiver_uuid = '${patient_uuid}'
                AND sender_uuid = User.uuid 
                ORDER BY date_time DESC) AS message, 
                (SELECT User.first_name, User.last_name, User.uuid
                FROM User 
                WHERE User.uuid = '${patient_uuid}') AS receiver 
            WHERE message.receiver_uuid = receiver.uuid ) X 
            ORDER BY X.date_time ASC`

                db.query(sql, function(err, result) {
                    if (err) console.log(err)

                    doctorFirstName = ""
                    doctorLastName = ""
                    patientFirstName = ""
                    patientLastName = ""

                    if (result.length == 0) {
                        console.log("I am inside empty message for patient")
                        console.log(doctor_uuid)
                        console.log(patient_uuid)
                        var sql2 = "SELECT User.first_name,User.last_name FROM User WHERE User.uuid = '" + doctor_uuid + "';"
                        db.query(sql2, function(err, result1) {
                            if (err) console.log(err)

                            console.log(result1)

                            doctorFirstName = result1[0].first_name
                            doctorLastName = result1[0].last_name

                            console.log(doctorFirstName)
                            console.log(doctorLastName)

                            res.render('patient_messaging.ejs', { doctor_uuid: doctor_uuid, doctorLastName: doctorLastName, patient_uuid: patient_uuid, patientFirstName: patientFirstName, patientLastName: patientLastName, messageList: messageList })
                        })
                    } else { // if doctor is the sender of the message
                        if (doctor_uuid == result[0].sender_uuid) {
                            doctorFirstName = result[0].senderFirstName
                            doctorLastName = result[0].senderLastName
                            patientFirstName = result[0].receiverFirstName
                            patientLastName = result[0].receiverLastName
                        }
                        // if patient is the sender of the message
                        else if (patient_uuid == result[0].sender_uuid) {
                            doctorFirstName = result[0].receiverFirstName
                            doctorLastName = result[0].receiverLastName
                            patientFirstName = result[0].senderFirstName
                            patientLastName = result[0].senderLastName
                        }

                        for (let i = 0; i < result.length; i++) { messageList.push(result[i]) }

                        console.log("I am desplaying messaginges")
                        console.log(messageList)
                        res.render('patient_messaging.ejs', { doctor_uuid: doctor_uuid, doctorLastName: doctorLastName, patient_uuid: patient_uuid, patientFirstName: patientFirstName, patientLastName: patientLastName, messageList: messageList })


                    }


                })
            }





        })
    })
})


app.post('/patientMessaging', checkAuthenticated, function(req, res) {

    patient_uuid = req.session.user.uuid
    message = req.body.patientmessage
    console.log(patient_uuid)

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

    db.connect(function(err) {
        var sql = `SELECT Doctor.user_uuid FROM Doctor WhERE Doctor.patient_uuid = '${patient_uuid}'` // fetch the doctor's uuid
        db.query(sql, function(err, result1) {
            if (err) throw err;
            const doctor_uuid = result1[0].user_uuid

            db.connect(function(err) {
                if (err) throw err;
                // insert into the message table the message that was sent by the patient to the doctor 
                var sql = "INSERT INTO Messages  VALUES ('" + patient_uuid + "','" + doctor_uuid + "','" + message + "','" + year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds + "')";
                db.query(sql, function(err, result) {
                    if (err) throw err;
                })
            })
            res.status(200).redirect(req.originalUrl)

        });
    })

})

//load index page of doctor
app.get('/doctorIndex', checkDoctor, (req, res) => {

    res.render('doctor_index.ejs', { name: req.session.user.name, lastname: req.session.user.lastname })
})

//query symptoms from database
app.get('/symptoms', checkAuthenticated, (req, res) => {
        try {
            console.log(req.session.user.uuid)
                //fetching the info from history ordered by descending time where its the current user uuid 
            var sql = "SELECT * FROM History WHERE uuid = '" + req.session.user.uuid + "' order by datetime desc;"
            var symptoms = [];

            db.query(sql, function(err, rows) {
                try {
                    //console.log(rows[0])
                    if (err) console.log(err);

                    for (let i = 0; i < rows.length; i++) {
                        //converting the date time into a different format 
                        rows[i].datetime = rows[i].datetime.toISOString().slice(0, 19).replace('T', ' ')
                        symptoms.push(rows[i])
                            // dates.push(rows[i].datetime)
                    }
                    //console.log(symptoms);
                    //rendering the patient symptom page 
                    res.render('patient_symptoms.ejs', { symptoms: symptoms })
                } catch (err) {
                    console.log(err)
                }
            })

        } catch (err) {
            console.log('error')
        }

    })
//post postal symptoms into database from form
app.post('/symptoms', checkAuthenticated, (req, res) => {
    try {
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

        //This query will insert the new symptom in the symptoms history table
        var sql = "INSERT INTO History(uuid, symptom, datetime) Values ('" + req.session.user.uuid +
            "', '" + req.body.newSymptom + "', '" + year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds + "');"
        db.query(sql, (err, result) => {
            try {
                if (err) console.log(err);
                //console.log('hi')
            } catch (err) {
                //console.log(err)
            }

        })


        // This query will fetch the doctor uuid of the patient
        var sql1 = "Select * from Doctor Where patient_uuid = '" + req.session.user.uuid + "'"
        db.query(sql1, (err1, result1) => {
            try {
                console.log(result1)
                if (err1) console.log(err1);
                if (result1.length > 0) {
                    console.log(result1.user_uuid)
                    var message = "Hi! I have a new Symptom: " + req.body.newSymptom + " on date " + year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds
                    //This query will send the message to the doctor when a new symptom is added
                    var sql2 = "Insert into Messages Values ('" + req.session.user.uuid + "','" + result1[0].user_uuid + "' , '" + message + "', '" + year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds + "')"

                    console.log(sql2)
                    db.query(sql2, (err2, result2) => {
                        try {
                            if (err2) console.log(err2);
                            console.log('hi')
                        } catch (err2) {
                            console.log(err2)
                        }

                    })
                } else if (result1.length <= 0) { // if this patient has no doctor

                    console.log("No doctor Available")

                }
            } catch (err1) {
                console.log(err1)
            }

        })


        res.redirect('./symptoms')
    } catch (err) {
        console.log(err)
    }
})

//post postal codes into database from form
app.post('/locations', checkAuthenticated, (req, res) => {
        try {
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
            // inserting the values into the database
            var sql = "INSERT INTO Tracking(uuid, postalcode, datetime) Values ('" + req.session.user.uuid +
                "', '" + req.body.postalCode + "', '" + year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds + "');"
            db.query(sql, (err, result) => {
                try {
                    if (err) console.log(err);

                } catch (err) {
                    console.log(err)
                }

            })


            res.redirect('./locations')
        } catch (err) {

        }

    })
//query locations from database
app.get('/locations', checkAuthenticated, (req, res) => {
    try {
        console.log(req.session.user.uuid)
            //fetching the info from the current user by descending date time 
        var sql = "SELECT * FROM Tracking WHERE uuid = '" + req.session.user.uuid + "' order by datetime desc;"
        var postalCodes = [];

        db.query(sql, function(err, rows) {
            try {
                console.log(rows[0])
                if (err) console.log(err);

                for (let i = 0; i < rows.length; i++) {
                    //converting the datetime into a different format 
                    rows[i].datetime = rows[i].datetime.toISOString().slice(0, 19).replace('T', ' ')
                    postalCodes.push(rows[i])

                }
                console.log(postalCodes);
                //rendering the location page 
                res.render('locations.ejs', { postalCodes: postalCodes })
            } catch (err) {
                console.log(err)
            }
        })

    } catch (err) {
        console.log('error')
    }

})


//page where doctors can see patients symptoms history
app.get('/symptomsMonitor/:patient_id', checkDoctor, (req, res) => {
    //store patient_uuid from parameters
    const patient_uuid = req.params.patient_id
    

    //fetching the info from history ordered by descending time where its the current user uuid 
    var sql = "SELECT * FROM History WHERE uuid = '" + req.params.patient_id + "' order by datetime desc;"
    var symptoms = [];

    db.query(sql, function(err, rows) {
        try {
            
            if (err) console.log(err);

            for (let i = 0; i < rows.length; i++) {
                //converting the date time into a different format 
                rows[i].datetime = rows[i].datetime.toISOString().slice(0, 19).replace('T', ' ')
                symptoms.push(rows[i])
                
            }
            
            //rendering the doctors patient symptom page 
            res.render('doctor_symptoms.ejs', { symptoms: symptoms, patient_id: patient_uuid })
        } catch (err) {
            console.log(err)
        }
    })


})
//render the booking appointments page with dynamic data (doctor name)
app.get('/patientAppointment', checkAuthenticated, (req, res) => {
    // this query will get the name of the doctor for this patient if exist
    var sql = "Select uuid as doctoruuid,first_name as doctorfn, last_name as doctorln from User,Doctor where User.uuid = user_uuid AND Doctor.patient_uuid = '" + req.session.user.uuid + "'"
    db.query(sql, (err, result) => {
        //try{
        if (err) console.log(err);
        
        
        if (result.length > 0) {
            
            const DfirstName = result[0].doctorfn
            const DlastName = result[0].doctorln
            const Duuid = result[0].doctoruuid
            res.render('patient_appointments.ejs', { doctor_first_name: DfirstName, doctor_last_name: DlastName, doctor_uuid: Duuid })
                //date format YYYY-MM-DD hh:mm:ss
        } else 
        {
           
            const DfirstName = 'NA' //default doctor for no patients (for emergency or urgent cases only)
            const DlastName = 'NA'
            const Duuid = '0' // default doctor for patients with no doctor
            res.render('patient_appointments.ejs', { doctor_first_name: DfirstName, doctor_last_name: DlastName, doctor_uuid: Duuid })

           
        }
        

    })

})

// This route will insert the appointment into the database
app.post('/patientAppointment', checkAuthenticated, function(req, res) {

    // TODO
    // receive data from frontend
    // insert data into database
    const patient_uuid = req.session.user.uuid
    const doctor_uuid = req.body.doctor_uuid
    const datetime = req.body.datetime
    var description = req.body.description
    const doctor_first_name = req.body.doctor_first_name
    const doctor_last_name = req.body.doctor_last_name
    const patient_first_name = req.session.user.name
    const patient_last_name = req.session.user.lastname
        
    // This query will insert the appointment into appointments table
    var sql = `INSERT INTO Appointment Values ('${doctor_uuid}','${patient_uuid}','${datetime}','${description}')`
    try {
        db.query(sql, (err, result) => {
            if (err) console.log(err)
            try {

                if (description === '') {// if no description, add none to not fail the URL querying
                    description = 'none'
                    
                } else {
                    console.log("I am inside else")

                    console.log(description)

                }
                // res.redirect('/patientAppointmentConfirmation/' + datetime)

            } catch (err) {
                console.log(err)
            }

            // send email to patient
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'covidconnectinquiries@gmail.com',
                    pass: 'qiihsxhtqrlunlhq'
                }
            });

            var mailOptions = {
                from: 'covidconnectinquiries@gmail.com',
                to: req.session.user.email,
                subject: 'CovidConnect: Upcoming Appointment',
                text: `Hello, \n\nThis email is to confirm your appointment with a CovidConnect doctor at ${datetime}.\n\nHave a great day,\n\n-CovidConnect\n\nYou are receiving this email because you booked an appointment on CovidConnect. This is apart of a school project for SOEN 390 at Concordia University in Montreal, Quebec. If you don't know what I am talking about please disregard this email.`
            };

            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.log("Could not send email to " + req.session.user.email)
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });



            res.redirect('/patientAppointmentConfirmation/' + datetime)



        })
    } catch (err) {
        console.log(err)
    }
})

// render confirmation page after booking is successfull 
app.get('/patientAppointmentConfirmation/:datetime', checkAuthenticated, (req, res) => {

    const datetime = req.params.datetime

    // Query the patient name, doctor name, and appointment details to be desplayed in the confirmation test
    const sql = `SELECT patient.uuid, patient.first_name AS patient_first_name , patient.last_name As patient_last_name , patient.datetime, patient.descr As description, TEMP.doctor_first_name, TEMP.doctor_last_name
    FROM (SELECT User.uuid, User.first_name  , User.last_name  , Appointment.datetime, Appointment.descr 
          FROM User, Appointment WHERE Appointment.patient_uuid = User.uuid AND User.uuid = '${req.session.user.uuid}' AND Appointment.datetime = '${datetime}' ) AS patient ,
    
    
    (SELECT User.first_name AS doctor_first_name, User.last_name As doctor_last_name, User.uuid, Doctor.patient_uuid As patient_uuid FROM User,Doctor Where User.uuid = Doctor.user_uuid ) AS TEMP 
    WHERE patient.uuid = TEMP.patient_uuid  `


    var description
    var doctor_first_name
    var doctor_last_name
    var patient_first_name
    var patient_last_name

    try {
        db.query(sql, (err, result) => {
            if (err) console.log(err)
            try {
                if (result.length == 0) {
                    // Query the appointment details if the patient has no assigned doctor (only has default doctor)
                    const sql2 = `SELECT patient.uuid, patient.first_name AS patient_first_name , patient.last_name As patient_last_name , patient.datetime, patient.descr As description
                    FROM (SELECT User.uuid, User.first_name  , User.last_name  , Appointment.datetime, Appointment.descr 
                          FROM User, Appointment WHERE Appointment.patient_uuid = User.uuid AND User.uuid = '${req.session.user.uuid}' AND Appointment.datetime = '${datetime}' ) AS patient`

                    db.query(sql2, (err, result1) => {
                        if (err) console.log(err)
                        try {
                            
                            description = result1[0].description
                            doctor_first_name = "To be Determined"
                            doctor_last_name = "To be Determined"
                            patient_first_name = req.session.user.name
                            patient_last_name = req.session.user.lastname

                            res.render('./patient_appointments_confirmation.ejs', { datetime: datetime, description: description, doctor_first_name: doctor_first_name, doctor_last_name: doctor_last_name, patient_first_name: patient_first_name, patient_last_name: patient_last_name })
                        } catch (err) {
                            console.log(err)
                        }

                    })

                } else if (result.length != 0) {
                    description = result[0].description
                    doctor_first_name = result[0].doctor_first_name
                    doctor_last_name = result[0].doctor_last_name
                    patient_first_name = req.session.user.name
                    patient_last_name = req.session.user.lastname

                    res.render('./patient_appointments_confirmation.ejs', { datetime: datetime, description: description, doctor_first_name: doctor_first_name, doctor_last_name: doctor_last_name, patient_first_name: patient_first_name, patient_last_name: patient_last_name })

                }

            } catch (err) {
                console.log(err)
            }

        })


    } catch {

    }





})
// Display all appointments for this patient
app.get('/allAppointmentsPatient', checkAuthenticated, (req, res) => {
    //this query will get all the appointments for the patient in addition of the appointments' details
    const sql = `SELECT patient.uuid, patient.first_name AS patient_first_name , patient.last_name As patient_last_name , patient.datetime, patient.descr As description, TEMP.doctor_first_name, TEMP.doctor_last_name
    FROM (SELECT User.uuid, User.first_name  , User.last_name  , Appointment.datetime, Appointment.descr 
          FROM User, Appointment WHERE Appointment.patient_uuid = User.uuid AND User.uuid = '${req.session.user.uuid}' ) AS patient ,
    
    
    (SELECT User.first_name AS doctor_first_name, User.last_name As doctor_last_name, User.uuid, Doctor.patient_uuid As patient_uuid FROM User,Doctor Where User.uuid = Doctor.user_uuid ) AS TEMP 
    WHERE patient.uuid = TEMP.patient_uuid Order BY ABS( DATEDIFF(  patient.datetime, NOW() ) ) `

    var appointment = []
    try {
        db.query(sql, (err, result) => {
            if (err) console.log(err)
            try {

                if (result.length > 0) {
                    for (i = 0; i < result.length; i++) {

                        appointment.push(result[i])
                    }

                    res.render('allAppointmentsPatient.ejs', { appointment: appointment })
                } else {
                    // same as query before but for patients with no doctor
                    const sql2 = `SELECT patient.uuid, patient.first_name AS patient_first_name , patient.last_name As patient_last_name , patient.datetime, patient.descr As description
                    FROM (SELECT User.uuid, User.first_name  , User.last_name  , Appointment.datetime, Appointment.descr 
                    FROM User, Appointment WHERE Appointment.patient_uuid = User.uuid AND User.uuid = '${req.session.user.uuid}' ) AS patient Order BY ABS( DATEDIFF(  patient.datetime, NOW() ) ) `

                    try {
                        db.query(sql2, (err, result1) => {
                            if (err) console.log(err)
                            try {

                                for (i = 0; i < result1.length; i++) {

                                    appointment.push(result1[i])
                                    appointment[i].doctor_first_name = "To Be Determined"
                                    appointment[i].doctor_last_name = "To Be Determined"
                                }

                                res.render('allAppointmentsPatient.ejs', { appointment: appointment })
                            } catch (err) {
                                console.log(err)
                            }

                        })
                        
                            
                    } catch {

                    }


                }

            } catch (err) {

            }

        })
      
    } catch {

    }


})
// Check if the date chosen for the appointment is available 
app.post('/checkAvailability/:doctor_uuid/:date_time/:description', (req, res) => {

    doctor_uuid = req.params.doctor_uuid
    date_time = req.params.date_time
    description = req.params.description

    console.log("I am inside server")
    console.log(description);
    console.log("The rest is")
    console.log(date_time)
    console.log(description)
    // this query will check if the doctor has an appointment at the time chosen by the patient
    const sql = `
        SELECT * from Appointment 
        Where doctor_uuid = '${doctor_uuid}' AND datetime = '${date_time}' 
    `

    

    res.setHeader('Content-Type', 'application/json');
    db.query(sql, function(err, result) {
        try {
            if (err) console.log(err);
            if (result.length === 0) {
                res.end(JSON.stringify({ message: 'sucess' }));
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'There is already an apointment at that time.' }));

            }
        } catch (err) {
            console.log(err)
        }
    })
})
// Display all appointments for the doctor
app.get('/doctorAllAppointments', checkAuthenticated, (req, res) => {
    var appointment = []
    const doctor_uuid = req.session.user.uuid
    //This query will get the appointments and their details for the signed-in doctor
    const sql = `SELECT patient.uuid, patient.first_name AS patient_first_name , patient.last_name As patient_last_name , patient.datetime, patient.descr As description, TEMP.doctor_first_name, TEMP.doctor_last_name
    FROM (SELECT User.uuid, User.first_name  , User.last_name  , Appointment.datetime, Appointment.descr 
          FROM User, Appointment WHERE Appointment.patient_uuid = User.uuid  ) AS patient ,
    
    
    (SELECT User.first_name AS doctor_first_name, User.last_name As doctor_last_name, User.uuid, Doctor.patient_uuid As patient_uuid FROM User,Doctor Where User.uuid = Doctor.user_uuid AND User.uuid = '${req.session.user.uuid}' ) AS TEMP 
    WHERE patient.uuid = TEMP.patient_uuid Order BY ABS( DATEDIFF(  patient.datetime, NOW()))`

    db.query(sql, function(err, result) {
        try {
            if (err) console.log(err);

            for (i = 0; i < result.length; i++) {
                appointment.push(result[i])


            }
            console.log(appointment)
            res.render('doctor_all_appointments.ejs', { appointment: appointment })
        } catch (err) {
            console.log(err)
        }
    })

})

app.get('/healthOfficialIndex', checkHealthOfficial, (req, res) => {

    //passes the users name and lastname in the the ejs template
    res.render('health_official_index.ejs', { name: req.session.user.name, lastname: req.session.user.lastname })
})
app.get('/statistics', checkHealthOfficial, (req, res) => {
    //query that gets all the patients' covid status 
    var total_covid = `
    SELECT Patient.covid
    FROM Patient`;

    var covid_list = [];
    db.query(total_covid, function(err, result) {
        if (err) console.log(err)

        covidRatio(result);
        //renderPage();
    })

    var covid = 0;
    var no_covid = 0;

    //function to count the number of covid positive versus covid negative patients
    function covidRatio(value) {
        covid_list = value;

        for (let i = 0; i < covid_list.length; i++) {
            if (covid_list[i].covid == 1) {
                covid += 1;

            } else if (covid_list[i].covid == 0) {
                no_covid += 1;
            }
        }
        total = covid + no_covid;
        covid = ((covid / total) * 100).toFixed(2)
        no_covid = ((no_covid / total) * 100).toFixed(2)
    }

    //////////////////////////////////////////////////////////////////////////////////
    //##############################################################################//
    //////////////////////////////////////////////////////////////////////////////////
    
    //select all symptoms from the symptom history data table
    var symptomQ = `
    SELECT History.symptom
    FROM History`;

    var symptom_list = [];
    db.query(symptomQ, function(err, result) {
        if (err) console.log(err)

        symptomRatio(result);
        //renderPage();
    })

    var cough = 0;
    var fever = 0;
    var tiredness = 0;
    var taste_or_smell = 0;
    var sore_throat = 0;
    var headache = 0;
    var diarrhea = 0;
    var aches_and_pains = 0;
    var chest_pain = 0;
    var other = 0;

    //function to count the number of occurences of each symptom
    function symptomRatio(value) {
        symptom_list = value;
        var total = 0;
        for (let i = 0; i < symptom_list.length; i++) {
            var symptom = symptom_list[i].symptom;
            //console.log(symptom)

            if (symptom === "cough") {
                cough += 1;
                total += 1;

            } else if (symptom === "fever") {
                fever += 1;
                total += 1;

            } else if (symptom === "tiredness") {
                tiredness += 1;
                total += 1;

            } else if (symptom === "lost of taste or smell") {
                taste_or_smell += 1;
                total += 1;

            } else if (symptom === "sore throat") {
                sore_throat += 1;
                total += 1;

            } else if (symptom === "headache") {
                headache += 1;
                total += 1;

            } else if (symptom === "diarrhea") {
                diarrhea += 1;
                total += 1;

            } else if (symptom === "aches and pains") {
                aches_and_pains += 1;
                total += 1;

            } else if (symptom === "chest pain") {
                chest_pain += 1;
                total += 1;

            } else if (symptom !== "") {
                other += 1;
                total += 1;

            }
        }

        cough = ((cough / total) * 100).toFixed(2)
        fever = ((fever / total) * 100).toFixed(2)
        tiredness = ((tiredness / total) * 100).toFixed(2)
        taste_or_smell = ((taste_or_smell / total) * 100).toFixed(2)
        sore_throat = ((sore_throat / total) * 100).toFixed(2)
        headache = ((headache / total) * 100).toFixed(2)
        diarrhea = ((diarrhea / total) * 100).toFixed(2)
        aches_and_pains = ((aches_and_pains / total) * 100).toFixed(2)
        chest_pain = ((chest_pain / total) * 100).toFixed(2)
        other = ((other / total) * 100).toFixed(2)
    }

    //////////////////////////////////////////////////////////////////////////////////
    //##############################################################################//
    //////////////////////////////////////////////////////////////////////////////////

    //query that gets all the patients
    var all_patients = `
    SELECT Patient.user_uuid
    FROM Patient`;

    //query that gets all the verfied workers
    var all_workers = `
    SELECT Worker.role
    FROM Worker
    WHERE verified = 1`;

    var patient_list = [];
    var worker_list = [];
    db.query(all_patients, function(err, result1) {
        if (err) console.log(err)
        db.query(all_workers, function(err, result2) {
            if (err) console.log(err)

            users(result1, result2);
            renderPage();
        })
    })

    var patient = 0;
    var doctor = 0;
    var nurse = 0;
    var health_official = 0;
    var immigration_officer = 0;

    function users(value1, value2) {
        patient_list = value1;
        worker_list = value2;
        patient = patient_list.length;
        for (let i = 0; i < worker_list.length; i++) {
            role = worker_list[i].role;

            if (role === "doctor") {
                doctor += 1;

            } else if (role === "nurse") {
                nurse += 1;

            } else if (role === "health official") {
                health_official += 1;

            } else if (role === "immigration officer") {
                immigration_officer += 1;

            }
        }
    }
    //render the health official's statistics page
    function renderPage() {
        res.render('health_official_statistics.ejs', {
            covid_ratio: [covid, no_covid],
            symptom_ratio: [cough, fever, tiredness, taste_or_smell, sore_throat, headache, diarrhea, aches_and_pains, chest_pain, other],
            sys_users: [patient, doctor, nurse, health_official, immigration_officer]
        })
    }


})
//app route to display the patients list on the health official site
app.get('/healthOfficialPatientList', checkHealthOfficial, (req, res) => {
    //query to select all patients from the database
    sql = `
    SELECT User.first_name, User.last_name, Patient.user_uuid, Patient.covid
    FROM Patient, User
    WHERE Patient.user_uuid = User.uuid
    ORDER BY Patient.covid DESC
    `;
    allpatients = [];
    //passes a list of all patients to the ejs template
    db.query(sql, function(err, result) {
        if (err) console.log(err)

        for (let i = 0; i < result.length; i++) {

            allpatients.push(result[i]);
        }
        res.render('health_official_patient_list.ejs', { allpatients: allpatients })
    })

})

app.get('/expose', checkAuthenticated, (req, res) => {
    var exposedPatients = []
    const houuid = req.session.user.uuid
    const sql = `Select A.uuid,User.first_name,User.last_name,User.email,A.postalcode,A.datetime,TIMEDIFF(A.datetime,B.datetime) 
                FROM Tracking A,Tracking B, Patient C,Patient D ,User
                WHERE (A.postalcode = B.postalcode AND A.uuid = User.uuid AND ABS(TIMEDIFF(A.datetime,B.datetime)) < '30:00:00' AND A.uuid <> B.uuid AND A.uuid = C.user_uuid AND B.uuid = D.user_uuid AND C.covid = 0 AND D.covid = 1)`

    db.query(sql, function(err, result) {
        try {
            if (err) console.log(err);

            for (i = 0; i < result.length; i++) {
                exposedPatients.push(result[i])
            }
            //console.log(appointment)
            res.render('healthofficialexposelist.ejs', { exposedPatients: exposedPatients })
        } catch (err) {
            console.log(err)
        }
    })

})

app.get('/informexposed/:patient_uuid/:datetime/:postalcode', checkAuthenticated, (req, res) => {

    const houuid = req.session.user.uuid
    const patient_uuid = req.params.patient_uuid
    const datetime = req.params.datetime
    const postalcode = req.params.postalcode
    const message = "Hi! You have been in contact with some how tested positive for COVID-19 in " + postalcode + " at " + datetime + ". Please do a PCR test and isolate yourself. Stay Safe, Stay Strong!  "
    let date_ob = new Date();
    console.log(message)
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
    const sql = "INSERT INTO Messages  VALUES ('" + houuid + "','" + patient_uuid + "','" + message + "','" + year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds + "')";

    db.query(sql, function(err, result) {
        try {
            if (err) console.log(err);

            res.redirect('/expose')


        } catch (err) {
            console.log(err)
        }
    })


})

app.get('/patientExposed', checkAuthenticated, function(req, res) {
    var messageList = []
    const patient_uuid = req.session.user.uuid

    const sql = `SELECT * FROM (SELECT message.sender_uuid,message.receiver_uuid,message.message,message.first_name as senderFirstName, message.last_name AS senderLastName, message.date_time,receiver.first_name AS receiverFirstName, receiver.last_name AS receiverLastName
                FROM (Select sender_uuid,receiver_uuid,message,date_time,User.first_name,User.last_name 
                FROM Messages, User 
                WHERE receiver_uuid = '${patient_uuid}' 
                AND sender_uuid = User.uuid 
                ORDER BY date_time DESC) As message, 
                (SELECT User.first_name,User.last_name,User.uuid 
                FROM User 
                WHERE User.uuid = '${patient_uuid}') AS receiver
                WHERE message.receiver_uuid = receiver.uuid AND message.sender_uuid NOT IN (SELECT Doctor.user_uuid FROM Doctor WHERE Doctor.patient_uuid = '${patient_uuid}') ) as temp`

    try {
        db.query(sql, function(err, result) {
            try {
                if (err) console.log(err);

                for (i = 0; i < result.length; i++) {
                    messageList.push(result[i])
                }

                res.render('patient_messaging_healthO.ejs', { messageList: messageList })

            } catch (err) {

            }



        })


    } catch (err) { console.log(err) }




})

//server start on port 3000
var app_server = app.listen(3000)
console.log('listening on 3000...http://localhost:3000')







// export variables to be used elsewhere
module.exports = {
    app: app,
    app_server: app_server
}