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
    res.render('doctor_monitor.ejs')
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

                res.status(200).render("patients_assign.ejs", { patients: patients, doctors: doctors })

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
    var sql = `
        Select u1.first_name, u1.last_name, u1.email, Patient.covid, Patient.symptoms, u1.uuid 
        FROM User u1, Patient
        WHERE Patient.user_uuid in (SELECT Patient.user_uuid from Doctor, Patient 
                                    WHERE Doctor.user_uuid = '${doctor_uuid}' 
                                    AND Doctor.patient_uuid = Patient.user_uuid) 
        AND Patient.user_uuid = u1.uuid;`

    db.query(sql, function(err, result) {
        if (err) console.log(err)

        for (let i = 0; i < result.length; i++) {

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
        Select  u1.uuid ,u1.first_name, u1.last_name, u1.email, Patient.covid, Patient.symptoms,Patient.diary, Address.street_number,Address.street_name , Address.apartment_number, Address.city, Address.province, Address.country, Address.zipcode
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
                {messageList.push(result[i])}

        
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
        var sql = "INSERT INTO Messages  VALUES ('"+doctor_uuid+"','"+patient_uuid+"','"+message+"','"+year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds+"')";
        db.query(sql, function(err, result) {
            if (err) throw err;
           
            res.status(200).redirect(req.originalUrl)
        
    });})

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

                            res.render('patient_messaging.ejs', { doctor_uuid: doctor_uuid, doctorLastName:doctorLastName,patient_uuid: patient_uuid, patientFirstName: patientFirstName, patientLastName: patientLastName, messageList: messageList })
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

                        for (let i = 0; i < result.length; i++)
                            {messageList.push(result[i])}

                        console.log("I am desplaying messaginges")
                        console.log(messageList)
                        res.render('patient_messaging.ejs', { doctor_uuid: doctor_uuid,doctorLastName:doctorLastName, patient_uuid: patient_uuid, patientFirstName: patientFirstName, patientLastName: patientLastName, messageList: messageList })


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

app.get('/doctorIndex', checkDoctor, (req, res) => {
    res.render('doctor_index.ejs')
})

//need to add requirement here for if the patient is authenticated:)
app.get('/symptoms',  checkAuthenticated,  (req, res) => {
    try{
        console.log(req.session.user.uuid)
        var sql = "SELECT * FROM History WHERE uuid = '" + req.session.user.uuid + "' order by datetime desc;"
        var symptoms = [];
        
        db.query(sql, function(err, rows) {
            try{
                console.log(rows[0])
                if (err) console.log(err);
                
                for (let i = 0; i < rows.length; i++){
                    rows[i].datetime = rows[i].datetime.toISOString().slice(0, 19).replace('T', ' ')
                    symptoms.push(rows[i])
                   // dates.push(rows[i].datetime)
                }
                console.log(symptoms);
                res.render('patient_symptoms.ejs',{symptoms: symptoms})
            }
            catch(err){
                console.log(err)
            }
        })
        
    }
    catch(err){
        console.log('error')
    }
    
})

app.post('/symptoms',  checkAuthenticated,  (req, res) => {
    try{
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
        
        var sql = "INSERT INTO History(uuid, symptom, datetime) Values ('"+ req.session.user.uuid 
        + "', '" + req.body.newSymptom + "', '" + year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds + "');"
        db.query(sql, (err, result) => {
            try{
                if (err) console.log(err);
                console.log('hi')
            }catch(err){
                console.log(err)
            }

        })
        res.redirect('./symptoms')
    }catch(err){
        console.log(err)
    }
})


app.post('/locations',  checkAuthenticated,  (req, res) => {
    try{
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

        var sql = "INSERT INTO Tracking(uuid, postalcode, datetime) Values ('"+ req.session.user.uuid 
        + "', '" + req.body.postalCode + "', '" + year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds + "');"
        db.query(sql, (err, result) => {
            try{
                if (err) console.log(err);
                
            }catch(err){
                console.log(err)
            }

        })


        res.redirect('./locations')
    }
    catch(err){

    }
    
})

app.get('/locations',  checkAuthenticated,  (req, res) => {
    try{
        console.log(req.session.user.uuid)
        var sql = "SELECT * FROM Tracking WHERE uuid = '" + req.session.user.uuid + "' order by datetime desc;"
        var postalCodes = [];
        
        db.query(sql, function(err, rows) {
            try{
                console.log(rows[0])
                if (err) console.log(err);
                
                for (let i = 0; i < rows.length; i++){
                    rows[i].datetime = rows[i].datetime.toISOString().slice(0, 19).replace('T', ' ')
                    postalCodes.push(rows[i])
                   
                }
                console.log(postalCodes);
                res.render('locations.ejs',{postalCodes:postalCodes})
            }
            catch(err){
                console.log(err)
            }
        })
        
    }
    catch(err){
        console.log('error')
    }
    
})

app.get('/symptomsMonitor', (req, res) => {
    res.render('doctor_symptoms.ejs')
})

//server start on port 3000
var app_server = app.listen(3000)
console.log('listening on 3000...http://localhost:3000')







// export variables to be used elsewhere
module.exports = {
    app: app,
    app_server: app_server
}
