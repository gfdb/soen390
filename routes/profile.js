const express = require('express')
const router = express()
const db = require('/Users/omarelk09/Desktop/SOEN 390 project/soen390/database.js')


// show the edit profile with the current user 
router.get('/', (req, res) => {
    console.log("Connected profile!")
     var userList  = []
     db.connect((err) => {
         if (err) console.log(err)
        
         var sql = "SELECT User.uuid,User.first_name,User.last_name,User.email,User.password,User.permission_level from User WHERE User.email='omartest@test.com'";
         db.query(sql, function(err, result) {
             if (err) console.log(err)
         
             for (let i = 0; i < result.length; i++) {
                 //Sorts users based on role
                 userList.push(result[i])
             }
             res.render('profile.ejs', {User: userList})
         })    
     })   
     
    
 })

// apply the changes

router.post('/edit', (req, res) => {
    var email = req.body.email;
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    db.connect((err) => {
        if (err) console.log(err)
        console.log("Connected edit profile2!")
        var sql = "UPDATE User SET User.first_name = '"+ first_name + "',User.last_name = '" + last_name + "' WHERE User.email = '" + email + "';";
        db.query(sql, function(err, result) {
            if (err) console.log(err)
        });    
    }) ;res.redirect('./profile')   
})

//fills in the edit page with the current info
router.get('/edit',(req, res) =>{
    var userList  = []
    db.connect((err) => {
        if (err) console.log(err)
        console.log("Connected edit profile1!")
        var sql = "SELECT User.uuid,User.first_name,User.last_name,User.email,User.password,User.permission_level from User WHERE User.email='omartest@test.com'";
        db.query(sql, function(err, result) {
            if (err) console.log(err)
        
            for (let i = 0; i < result.length; i++) {
                //Sorts users based on role
                userList.push(result[i])
            }
            res.render('edit-profile.ejs', {User: userList})
        })    
    })   
})
module.exports = router