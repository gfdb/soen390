var passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const bcrypt = require('bcrypt')
const db = require('./database')


passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, function verify(email, password, done) {

    db.query('SELECT * FROM User WHERE User.email = \'' + email + '\'', async(err, user) => {
        if (err) { return done(err); }
        if (user.length == 0) { return done(null, false, { message: 'Incorrect email or password.' }) }
        user = user[0]

        const check_pass = await bcrypt.compare(password, user.password);
        console.log(check_pass)

        try {
            if (check_pass) {
                user = new User(
                    user['uuid'],
                    user['first_name'],
                    user['last_name'],
                    // user['address_uuid'],
                    user['email'],
                    user['permission_level']
                )
                console.log('succesfully logged in')
                return done(null, user)
            } else {
                return done(null, false, { message: 'Incorrect email or password.' })
            }
        } catch (e) {
            return done(e)
        }

    });
}));




// function initialize(passport, getUserById) {

//     const authenticateUser = async(email, password, done) => {
//         console.log('yo')
//         function getUserByEmail(email) {
//             db.get('SELECT * FROM users WHERE email = ?', [ email ], function(err, user) {
//                 if (err) { 
//                     console.log(err)
//                     return cb(err); 
//                 }
//                 if (!user) { 
//                     return cb(null, false, { message: 'Incorrect email or password.' })
//                 }
//                 return user
//             })
//         }

//         //below will need to be fixed User can be const and stuff sort out user
//         let user = getUserByEmail(email);
//         if (user == null) {
//             return done(null, false, { message: 'No user with that email' })
//         }
//         try {
//             if (await bcrypt.compare(password, user.password)) {
//                 return done(null, user)
//             } else {
//                 return done(null, false, { message: 'Password incorrect' })
//             }
//         } catch (e) {
//             return done(e)
//         }
//     }
//     passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
//     passport.serializeUser((user, done) => done(null, user.id))
//     passport.deserializeUser((id, done) => done(null, getUserById(id)))

// }
// module.exports = initialize