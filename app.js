const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');

const passport = require('passport');
const LocalStrat = require('passport-local');
const User = require('./models/user');

const usersRoutes = require('./routes/users');
const teslagroundsRoutes = require('./routes/teslaground');
const reviewsRoutes = require('./routes/reviews');

// Mongoose Connect
mongoose.connect('mongodb://localhost:27017/tesla-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Connected or Not (Error)
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database Connected!')
});

// Express(Override Requests) and EJS Setup
const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Expression Sessions:
const sessionConfig = {
    secret: 'secret!!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 604800000,
        maxAge: 604800000
    }
}
app.use(session(sessionConfig));

// Initalizing Passport:
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrat(User.authenticate()));

passport.serializeUser(User.serializeUser()); // Storing User in Session
passport.deserializeUser(User.deserializeUser()); // Getting User out of Session

// Creating Flashes and Flash/Passport Middleware
app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user; // Passport Auto-generates this to display if there is an active user
    next();
});

// Hardcode User
app.get('/fakeuser', async (req, res) => {
    const user = new User({ email: '123@gmail.com', username: '123' });
    const newUser = await User.register(user, '123');
    res.send(newUser);
})

// Connect to Routes
app.use('/', usersRoutes);
app.use('/teslagrounds', teslagroundsRoutes);
app.use('/teslagrounds/:id/reviews', reviewsRoutes);
//app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('home');
});

// 404 Error
app.all('*', (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

// Catch-all Error Handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = "Oh No, Something Went Wrong!"
    }
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log('Serving on Port 3000');
});
