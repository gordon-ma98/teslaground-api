const express = require('express');
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { reviewSchema } = require('../schemas.js');

const Teslaground = require('../models/teslaground');
const Review = require('../models/review');

// Middleware used to Validate Reviews
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errmsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(errmsg, 400);
    } else {
        next();
    }
};

// Review Creation
router.post('/', validateReview, catchAsync(async (req, res) => {
    const teslaground = await Teslaground.findById(req.params.id);
    const review = new Review(req.body.review);
    teslaground.reviews.push(review);
    await review.save();
    await teslaground.save();
    req.flash('success', 'Your Review has been Added!');
    res.redirect(`/teslagrounds/${teslaground._id}`);
}));

// Review Deletion:
router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Teslaground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Your Review has been Removed!');
    res.redirect(`/teslagrounds/${id}`);
}));

module.exports = router;