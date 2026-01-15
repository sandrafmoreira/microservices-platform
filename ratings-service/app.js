import express from "express";
import 'dotenv/config';
import logger from "./utils/logger.js";
import ratingsRoutes from "./routes/ratings.routes.js";
import swaggerUi from "swagger-ui-express"; 
import swaggerFile from "./swagger-output.json" with { type: "json" };

const app = express();

// Middlewares
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));


// Routes
app.use("/ratings",ratingsRoutes);



// Start server
const PORT = 3004;
const HOST = "127.0.0.1";
app.listen(PORT, () => logger.info(`Ratings service running on http://${HOST}:${PORT}/`));
 




