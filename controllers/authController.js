const User = require('../models/user');
const jwt = require('jsonwebtoken');

// handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    const errors = { username: '', email: '', password: '' };

    // duplicate email error code
    if (err.code === 11000) {
        errors.email = "That email is already registered, use another";
        return errors;
    }

    // user validation errors
    if (err.message.includes('User validation failed')) {
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        });
    }

    // incorrect email error for login
    if (err.message.includes('incorrect email')){
        errors.email = 'that email is not registered';
        return errors;
    }

    // incorrect pasword error for login
    if (err.message.includes('incorrect password')){
        errors.password = 'the password is not correct';
        return errors;
    }

    return errors;
}

// create cookie validity time
const maxAge = 3 * 24 * 60 * 60; // 3 days
// create jwt
const createToken = (id) => {
    return jwt.sign({ id }, 'kosi secret', {
        expiresIn: maxAge
    });
}

// set up multer for storing uploaded files
const multer = require('multer');
const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now());
    }
});
const upload = multer({ storage: storage }).single('image');


// returns the signup page
const signup_get  = (req, res) => {
    res.render('signup', {title: 'Sign Up'}) 
}

// tries to create a new user in the database
const signup_post = async (req, res) => {
    if (req.files === null) {
        const user_details = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
        }

        try{
            const user = await User.create(user_details);
            const token = createToken(user._id); // creating a token using the user's id in the database
            res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000}); // send cookie containing web token back as response
            res.status(201).json({ user: user._id }); // returns the user id
        }
        catch (err) {
            const errors = handleErrors(err); // fire error fxn and return result to var, errors
            res.status(400).json({ errors }); // returns the errors in json format if any 
        }
    } else{
        const user_details = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            profile_image: req.files.profile_image
        }
        profile_img_gen = user_details.profile_image;

        try{
            const user = await User.create(user_details); // creates the user in the user's collection, using the user model
            profile_img_gen.mv('./uploads/' + profile_img_gen.name); // moves the user's profile picture to the 'uploads' folder in the server
            const token = createToken(user._id); // creating a token using the user's id in the database
            res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000}); // send cookie containing web token back as response
            res.status(201).json({ user: user._id }); // returns the user id
        }
        catch (err) {
            const errors = handleErrors(err); // fire error fxn and return result to var, errors
            res.json({ errors }); // returns the errors in json format if any 
        }
    }
}

// renders the login page
const login_get = (req, res) => {
    res.render('login', {title: 'Log In'}) // returns login form
}

// tries to login a user based on provided details
const login_post = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000});
        res.status(200).json({ user: user._id }); // returns the user id in json format if any
    }
    catch (err){
        const errors = handleErrors(err);
        res.status(400).json({ errors }); // returns the errors in json format if any 
    }
}

// logs out a user
const logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
}

module.exports = {
    signup_get,
    signup_post,
    login_get,
    login_post,
    logout_get
}  