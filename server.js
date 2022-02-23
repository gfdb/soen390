//intilaizing express
const express = require("express")
const app = express()

//initializing db 
const db = require('d:/Documents/6_Maxwell_Concordia/Winter Semester 3/SOEN390/Repo/soen390/database')

// Static Files
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/img', express.static(__dirname + 'public/img'))

//setting up ejs 
app.set('views', './views');
app.set('view engine', 'ejs')


//path for home
app.get('/', (req, res) => {
    // console.log('home')
    // res.sendStatus(500)
    // res.status(500).send('crash')or.json({message:error})
    // res.send('test')
    res.render('index.ejs')
})

//importing routers
const signupRouter = require('./routes/signup')
app.use('/signup', signupRouter)

const profileRouter = require('./routes/profile')
app.use('/profile', profileRouter)

const loginRouter = require('./routes/login')
app.use('/login', loginRouter)


//added newly from front-end- probably need fixes on the backend
app.get('/approveRoles', (req, res) => {
    var doctorList  = []
    var nurseList  = []
    var healthOffList = []
    var immigrationOffList = []
    //Queries for the list of workers that have yet to be approved by the admin
    db.connect((err) => {
        if (err) console.log(err)
        console.log("Connected!")
        var sql = "SELECT Worker.role, User.first_name, User.last_name, Worker.user_uuid, User.email  FROM Worker, User WHERE Worker.user_uuid = User.uuid AND verified = 0";
        db.query(sql, function(err, result) {
            if (err) console.log(err)
             
            //var row = result
            //console.log(row[0].first_name)
            for (let i = 0; i < result.length; i++) {
                
                role = result[i].role
        
                switch(role) {
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
                //console.log("Ping")
            }

            //console.log(doctorList)
            //console.log(result)
            res.render('approve_roles.ejs', {doctors: doctorList, nurses: nurseList, healthOfficials: healthOffList, immigrationOfficers: immigrationOffList})
        })    
    })
    

})

app.get('/adminLogin', (req, res) => {
    res.render('admin_login.ejs')
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

 // for tests
module.exports = {
    app: app,
    app_server: app_server

}