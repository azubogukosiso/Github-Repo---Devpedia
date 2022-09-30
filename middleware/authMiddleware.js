const jwt = require('jsonwebtoken');
const User = require('../models/user'); // importing user model

// check if user is logged in
// it's fired when user tries to access restricted content
const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt; // gets the jwt (if there's any) from the request cookie and assigns it to var 'token'

    // check if json web token exists and then verifies it (if it exists)
    if (token) {
        jwt.verify(token, 'kosi secret', (err, decodedToken) => {
            if (err){
                res.redirect('/login'); // redirect to login if it isn't verified
            } else{
                req.user = decodedToken.id;
                next();
            }
        });
    } else { // if it doesn't exist, then redirect user to login page
        res.redirect('/login');
    }
}

// checks for id of current user
// if the user can't be id'ed, then the user isn't logged in and certain content
// is restricted from the user.
const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) { // check if json web token exists
        jwt.verify(token, 'kosi secret', async (err, decodedToken) => { // check if token is valid
            if (err){
                console.log(err.message);
                res.locals.user = null;
                next();
            } else{
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();
                return user;
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
}

module.exports = { requireAuth, checkUser };