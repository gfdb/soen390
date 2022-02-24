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