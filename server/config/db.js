const mongoose = require('mongoose');

const connectDB = async (uri) => {
    try {
        mongoose.set('strictQuery', false)
        const conn = await mongoose.connect(uri);
        console.log(`Database connection established on ${conn.connection.host}`);
    } catch (err) {
        console.log(err);
    }
}

module.exports = connectDB;