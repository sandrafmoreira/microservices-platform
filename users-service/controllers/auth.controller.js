require('dotenv').config();
const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"]; 
      const token = authHeader && authHeader.split(" ")[1]; 
    if (!token) return res.status(401).json({ error: "Access denied. Token missing." }); 
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => { 
    if (err) return res.status(403).json({ error: "Invalid token." }); 
    req.user = user; 
    next(); 
    }); 
}

exports.authorizeRole = (role) => {
    return (req, res, next) => { 
    if (req.user.role !== role) { 
      return res.status(403).json({ error: "Access forbidden: insufficient privileges." }); 
    } 
    next(); 
  }; 
}