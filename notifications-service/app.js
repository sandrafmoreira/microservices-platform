const express = require("express");

const swaggerUi = require("swagger-ui-express"); 
const swaggerFile = require("./swagger-output.json"); 

const mongoose = require("mongoose");

const pino = require("pino");
require('dotenv').config();

require("./jobs/cron.js");

const app = express();

const logger = pino({
    transport: {
        target: "pino-pretty",
        options: {colorize: true}
    }
}) 

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));
console.log("Mongo URI:", process.env.MONGO_URI);

const notifications_routes = require("./routes/notifications.routes.js");
app.use("/notifications", notifications_routes);


app.listen(3002, () => logger.info(`Notifications service running on port 3002`));