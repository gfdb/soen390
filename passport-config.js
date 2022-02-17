const LocalStrategy = require('passport-local').Strategy
const User = require('./models/users')
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail) {

    const authenticateUser = (email, password, done) => {
        const user = new User()
        const User = getUserByEmail(email)
        if (User == null) {
            return done(null, false, { message: 'No user with that email' })
        }
        try {
            if (await bcrypt.compare(password, User.password)) {
                return done(null, User)
            } else {
                return done(null, false, { message: 'Password incorrect' })
            }
        } catch (e) {
            return done(e)
        }
    }
    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
    passport.serializeUser((user, done) => {})
    passport.deserializeUser((id, done) => {})

}
module.exports = initialize