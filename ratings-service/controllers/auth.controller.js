import jwt from "jsonwebtoken";
import 'dotenv/config'; 
import logger from '../utils/logger.js';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"]; 
      const token = authHeader && authHeader.split(" ")[1]; 
    if (!token){ 
      logger.warn(`Unauthorized access attempt: No token provided at ${req.originalUrl}`);
      return res.status(401).json({ error: "Access denied. Token missing." })}; 
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => { 
    if (err){ 
      logger.error(`Invalid token attempt: ${err.message}`);
      return res.status(403).json({ error: "Invalid token." })}; 
    req.user = user; 
    next(); 
    }); 
}

export const authorizeRole = (role) => {
    return (req, res, next) => { 
    if (req.user.role !== role) { 
      logger.warn(`Forbidden: User [${req.user?.id || 'Unknown'}] tried to access ${role} restricted area.`);
      return res.status(403).json({ error: "Access forbidden: insufficient privileges." }); 
    } 
    next(); 
  }; 
}