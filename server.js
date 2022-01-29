//intilaizing express
const express = require("express")
const app = express()

//setting up ejs 
app.set("view-engine", "ejs")


//TEMPORARY LOGIN STUFF###################################################################################################
const bcrypt = require("bcrypt")
const username = "John@gmail.com"
const password = bcrypt.hash("1234", 10)
const plain_password = "1234"
app.use(express.urlencoded({ extended: false}))
//########################################################################################################################


//path for home
app.get('/', (req, res) => {
    // console.log('home')
    // res.sendStatus(500)
    // res.status(500).send('crash')or.json({message:error})
    // res.send('test')
    res.render('index.ejs', { text: 'world' })
})

//TEMPORARY LOGIN STUFF###################################################################################################
app.get("/login", (req, res) => {
    res.render('login_temp.ejs')
})

app.post("/login", (req, res) => {
    if (username != req.body.username){
        return res.status(400).send("Invalid username")
    }
    try{
        const password_check = bcrypt.compare(req.body.password, password)
        if(plain_password == req.body.password){
            res.redirect("/profile")
            //res.status(400).send('Incorrect Password!')
        }else{
            res.status(400).send('Incorrect Password!')
            //res.redirect("/profile")
        }
    }catch{
        res.status(500).send()
    }
})

app.get("/profile", (req, res) => {
    res.render("profile.ejs")
})
//########################################################################################################################

//setting up login routers
const loginRouter = require('./routes/login')
app.use('/login', loginRouter)

//server start on port 300
app.listen(3000)
console.log('listening on 3000...http://localhost:3000')