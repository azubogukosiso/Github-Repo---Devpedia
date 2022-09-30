const User = require('../models/user');
const bcrypt = require('bcrypt');

// rendering the user's profile
const profile_get = (req, res) => {
    res.render('profile', {title: 'Your Profile'})
}

// changing the username
const profile_change_username = (req, res) => {
    User.findById(req.params.id)
        .then(details => {
            if (details.username === req.body.username) {
                res.json({ info: 'Username is the same as before!' })
            } else{
                details.username = req.body.username;
                details.save()
                    .then(() => {
                        res.status(201).json({ success: 'Username updated!' })
                    })
                    .catch(err => {
                        res.status(400).json({ error: 'An error occurred!' })
                    })
            }
        })
        .catch(err => res.status(400).json({ error: 'An error occurred!' }));
}

// changing the user's email
const profile_change_useremail = (req, res) => {
    User.findById(req.params.id)
        .then(details => {
            if (details.email === req.body.email) {
                res.json({ info: 'Email is the same as before!' })
            } else{
                details.email = req.body.email;
                details.save()
                    .then(() => {
                        res.status(201).json({ success: 'Email updated!' })
                    })
                    .catch(err => {
                        res.status(400).json({ error: 'An error occurred!' })
                    })
            }
        })
        .catch(err => res.status(400).json({ error: 'An error occurred!' }));
}

// changing the user's password
const profile_change_userpassword = async (req, res) => {

    const userId = req.params.id;
    const newPassword = req.body.password;

    User.findById(userId)
        .then(async(details) => {
            const validPwd = await bcrypt.compare(newPassword, details.password);
            if (validPwd) {
                res.json({ info: "Password is the same as before!" });
            } else{
                // hash the password ...
                const salt = await bcrypt.genSalt(10);
                const hashPassword = await bcrypt.hash(newPassword, salt);

                // ... update it in the database
                User.findByIdAndUpdate(userId, { password: hashPassword })
                    .then(() => {
                        res.status(201).json({ success: 'Password updated!' })
                    })
                    .catch(err => {
                        res.status(400).json({ error: 'An error occured' })
                    });
            }
        })
        .catch(err => {
            res.status(400).json({ error: 'An error occured' })
        })
}

module.exports = {
    profile_get,
    profile_change_username,
    profile_change_useremail,
    profile_change_userpassword
}
