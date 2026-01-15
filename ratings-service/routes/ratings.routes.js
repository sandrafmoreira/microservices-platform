import express from "express";
import { authenticateToken, authorizeRole } from "../controllers/auth.controller.js";
import { 
    getAllRatings, 
    getRatingById, 
    getRatingsByUserId, 
    getRatingsByMarketId, 
    createRating, 
    updateRating, 
    deleteRating 
} from "../controllers/ratings.controller.js";
const router = express.Router();


// Controller functions
router.get("/", getAllRatings);

router.get("/:id", getRatingById);

router.get("/markets/:id", getRatingsByMarketId);   
router.get("/users/:id", authenticateToken, getRatingsByUserId);                               

router.post("/", authenticateToken, createRating);

router.put("/:id", authenticateToken, updateRating);

router.delete("/:id", authenticateToken, deleteRating);

export default router;