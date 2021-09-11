const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');

const teslagrounds = require('./routes/teslaground');
const reviews = require('./routes/reviews');

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

// Creating Flashes and Flash Middleware
app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Connect to Routes
app.use('/teslagrounds', teslagrounds);
app.use('/teslagrounds/:id/reviews', reviews);
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
