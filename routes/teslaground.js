const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { teslagroundSchema } = require('../schemas.js');
const ExpressError = require('../utils/ExpressError');
const Teslaground = require('../models/teslaground');

// Middleware used to Validate Teslagrounds
const validateTeslaground = (req, res, next) => {
    // Join the Error Messages
    const { error } = teslagroundSchema.validate(req.body);
    if (error) {
        const errmsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(errmsg, 400);
    } else {
        next();
    }
};

// Display All
router.get('/', catchAsync(async (req, res) => {
    const teslagrounds = await Teslaground.find({});
    res.render('teslagrounds/index', { teslagrounds });
}));

// Display Create
router.get('/new', (req, res) => {
    res.render('teslagrounds/new');
});

// Post Create
router.post('/', validateTeslaground, catchAsync(async (req, res, next) => {
    // if (!req.body.teslaground) throw new ExpressError('Invalid Teslaground Data', 400);
    const teslaground = new Teslaground(req.body.teslaground);
    await teslaground.save();
    req.flash('success', 'A New Teslaground has been Successfully Created!');
    res.redirect(`/teslagrounds/${teslaground._id}`);
}));

// Display Single
router.get('/:id', catchAsync(async (req, res) => {
    const teslaground = await Teslaground.findById(req.params.id).populate('reviews');
    if (!teslaground) {
        req.flash('error', 'This Teslaground Cannot be Found!');
        return res.redirect('/teslagrounds');
    }
    res.render('teslagrounds/show', { teslaground });
}));

// Display Update/Edit
router.get('/:id/edit', catchAsync(async (req, res) => {
    const teslaground = await Teslaground.findById(req.params.id);
    if (!teslaground) {
        req.flash('error', 'This Teslaground Cannot be Found!');
        return res.redirect('/teslagrounds');
    }
    res.render('teslagrounds/edit', { teslaground });
}));

// Put (Patching)
router.put('/:id', validateTeslaground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const teslaground = await Teslaground.findByIdAndUpdate(id, { ...req.body.teslaground });
    req.flash('success', 'This Teslaground has been Successfully Updated!');
    res.redirect(`/teslagrounds/${teslaground._id}`);
}));

// Delete
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Teslaground.findByIdAndDelete(id);
    req.flash('success', 'The Teslaground has been Removed!');
    res.redirect('/teslagrounds')
}));

module.exports = router;