
// Passport Checks if a User is Logged In
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Please Sign in to Create');
        return res.redirect('/login');
    }
    next();
}