const LocalStrategy = require('passport-local').Strategy
const User = require('./models/users')
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {

    const authenticateUser = async(email, password, done) => {
        //below will need to be fixed User can be const and stuff sort out user
        const user = new User()
        user.email = getUserByEmail(email)
        if (user == null) {
            return done(null, false, { message: 'No user with that email' })
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else {
                return done(null, false, { message: 'Password incorrect' })
            }
        } catch (e) {
            return done(e)
        }
    }
    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => done(null, getUserById(id)))

}
module.exports = initialize