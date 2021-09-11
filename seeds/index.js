const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');
const Teslaground = require('../models/teslaground');

// Mongoose Connect
mongoose.connect('mongodb://localhost:27017/tesla-camp', {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
});

// Connected or Not (Error)
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database Connected!')
});

// Select Random Element in Array
const sample = (array) => array[Math.floor(Math.random() * array.length)];

// Displaying Cities
const seedDB = async () => {
    await Teslaground.deleteMany({});
    for (let i = 0; i < 50; ++i) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 30) + 50;
        const tesla = new Teslaground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/86378494',
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Cupiditate voluptates fugiat repudiandae natus teneturlaudantium maiores facere dolorem laborum velit! Impedit commodi modi ad odio officiis laboriosam maxime reiciendisquam.',
            price: price
        });
        await tesla.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});