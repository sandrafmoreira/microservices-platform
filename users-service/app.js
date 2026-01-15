const express = require("express");
const swaggerUi = require("swagger-ui-express"); 
const swaggerFile = require("./swagger-output.json"); 
const jwt = require('jsonwebtoken');
const pino = require("pino");
require('dotenv').config();

const app = express();

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {colorize: true}
  }
}) 

// Middlewares
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use('/uploads', express.static('uploads')); // save images


// Routes
const user_routes = require("./routes/users.routes.js");
const seller_routes = require('./routes/sellers.routes.js');
const questionnaire_routes = require('./routes/questionnaires.routes.js');

app.use(user_routes);
app.use('/users/sellers', seller_routes);
app.use('/users/questionnaires', questionnaire_routes);

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST;
app.listen(PORT, () => logger.info(`Users service running on http://${HOST}:${PORT}/`));