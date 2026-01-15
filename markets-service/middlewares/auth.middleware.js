import jwt from "jsonwebtoken";
import 'dotenv/config'; 
import logger from '../utils/logger.js';


export const authenticateToken = (req) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return null;

    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        logger.warn(`Authentication failed: ${error.message}`);
        //throw new Error(`Authentication error: ${error.message}`);
        return null;

    }
}

export const authorizeRole = (user, role) => {
    if (!user) {
        logger.warn("Access denied: Attempted restricted action without login.");
        throw new Error("Access denied: missing or invalid token.");
    }
    if (user.role !== role) {
        logger.warn(`Access forbidden: User ${user.id} tried to act as ${role}.`);
        throw new Error("Access forbidden: insufficient privileges.");
       
    }
}