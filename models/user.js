const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

// This is solely for Email
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})

// Added on Username and Password (Added Serialize and Deserialize)
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);