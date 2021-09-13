const express = require('express');
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const router = express.Router();
const User = require('../models/user');

// Register Route:
router.get('/register', (req, res) => {
    res.render('users/register');
});

// Posting a Registration
router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredU = await User.register(user, password);
        //Log in After Register
        req.login(registeredU, error => {
            if (error) {
                return next(error);
            } else {
                req.flash('success', 'Welcome to Teslagrounds!');
                res.redirect('/teslagrounds');
            }
        });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/register');
    }
}));

// Login Forms
router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome Back to Teslagrounds!');
    const redirect = req.session.returnTo || '/teslagrounds';
    delete req.session.returnTo;
    res.redirect(redirect);
});

// Logout Forms
router.get('/logout', (req, res) => {
    req.logout(); //Passport Logout
    req.flash('success', 'You have been Successfully Logged Out!')
    res.redirect('/teslagrounds')
})

module.exports = router;