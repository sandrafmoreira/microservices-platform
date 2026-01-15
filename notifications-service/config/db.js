const mongoose = require("mongoose");
require('dotenv').config({ path: '../.env' });

const db = {};
db.mongoose = mongoose;

(async () => {
    try {
        const config = {
            USER: process.env.DB_USER,
            PASSWORD: process.env.DB_PASSWORD,
            DB: process.env.DB_NAME,
            HOST: process.env.DB_HOST
        };
        
        const mongoDBURL = `mongodb+srv://${config.USER}:${config.PASSWORD}@${config.HOST}/${config.DB}?retryWrites=true&w=majority`;

        await db.mongoose.connect(mongoDBURL);
        console.log("Connected to the database!");

    } catch (error) {
        
        console.log("❌ Unable to connect to the database:", error);
        process.exit(1);
    }
})();

db.Notification = require('../model/Notification.js');

module.exports = db;