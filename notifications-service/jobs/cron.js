const cron = require("node-cron");
const mongoose = require("mongoose");

const Notification = require("../model/Notification");
const User = require("../../users-service/models/users.model")(mongoose);

const pino = require("pino");

const logger = pino({
    transport: {
        target: "pino-pretty",
        options: { colorize: true }
    }
});



cron.schedule("* * * * *", async () => {

    try {
        
        logger.info("Cron job Notification: Trying to send a new promotion everyday at 9h.");

        const users = await User.find({role:"buyer"}).select("_id");

        console.log("users:", users.length);
        console.log("Mongo URI do User:", mongoose.connection.client.s.url);


        const notifications = users.map(user => ({
            user_id: new mongoose.Types.ObjectId(),
            type: "promotion",
            content: "Special offer: 20% discount on all types of potatoes! Even the lazy ones..."
        }))

        await Notification.insertMany(notifications);
        logger.info("Cron job Notification: Notification sent.");

    } catch (error) {
        logger.error("Cron job Notification: Notification was NOT sent.")
    }

})