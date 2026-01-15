import axios from 'axios';
import 'dotenv/config';
import logger from '../utils/logger.js';
import db from '../models/db.js';


export const getAllRatings = async (req, res) => {
    /*  
        #swagger.tags = ['ratings'] 
        #swagger.description = 'Endpoint to list all ratings'
        #swagger.responses[200] = { 
            description: 'All ratings retrieved successfully', 
            schema: { 
                type: 'array',
                items: { $ref: '#/definitions/GetRating' } 
            }
        } 
        #swagger.responses[500] = { description: "Internal error."}
    */

    try {

        logger.info("GET /ratings received.");

        const ratings = await db.Rating.find();

        return res.status(200).json({
            message: "GET /ratings - Retrieved successfully.",
            data: ratings
        });

    } catch (error) {
        logger.error("GET /ratings - Failed.", error);
        return res.status(500).json({ error: "GET /ratings - Internal error." });
    }
};

export const getRatingById = async (req, res) => {
    /*  
        #swagger.tags = ['ratings'] 
        #swagger.description = 'Endpoint to get a rating by its Id'
        #swagger.responses[200] = { 
            description: 'Rating retrieved successfully', 
            schema: { $ref: '#/definitions/GetRating'} 
        } 
        #swagger.responses[404] = { description: "Rating not found." }
        #swagger.responses[500] = { description: "Internal error."}
    */

    try {

        logger.info(`GET /ratings/${req.params.id} received.`);

        const rating = await db.Rating.findById(req.params.id);

        if (!rating) {
            logger.warn(`GET /ratings/${req.params.id} - Not found.`);
            return res.status(404).json({ error: `GET /ratings/${req.params.id} - Not found.` });
        }

        logger.info(`GET /ratings/${req.params.id} - Retrieved successfully.`);

        return res.status(200).json({
            message: `GET /ratings/${req.params.id} - Retrieved successfully.`,
            data: rating
        })

    } catch (error) {
        logger.error(`GET /ratings/${req.params.id} - Failed.`, error);
        return res.status(500).json({ error: `GET /ratings/${req.params.id} - Internal error.` });
    }
};

export const getRatingsByUserId = async (req, res) => {
    /*  
        #swagger.tags = ['Ratings'] 
        #swagger.description = 'Endpoint to get all ratings of a specific user'
        #swagger.responses[200] = { 
            description: 'Ratings retrieved successfully', 
            schema: { 
                type: 'array',
                items: { $ref: '#/definitions/GetRating' } 
            }
        }
        #swagger.responses[403] = { description: 'Access denied.' }
        #swagger.responses[404] = { description: 'No ratings found for this user.' }
        #swagger.responses[500] = { description: 'Internal error.' }
    */

    try {

        logger.info(`GET /ratings/user/${req.params.id} received.`);

        const { id: userId } = req.params;
        logger.info(`Fetching ratings for user ID: ${userId}`);

        if (userId !== req.user.id && req.user.role !== "admin") {
            logger.warn('Access denied!')
            return res.status(403).json({ error: "You can only view your own rating history." })
        }

        const userRatings = await db.Rating.find({ user_id: userId });
        if (userRatings.length === 0) {
            logger.warn(`GET /ratings/user/${userId} - No ratings found for user ${userId}.`);
            return res.status(404).json({ error: `No ratings found for user ${userId}.` });
        }

        logger.info(`GET /ratings/user/${userId} - Retrieved ${userRatings.length} ratings successfully.`);

        return res.status(200).json({
            message: `Ratings for user ${userId} retrieved successfully.`,
            data: userRatings
        });

    } catch (error) {
        logger.error(`GET /ratings/user/${userId} - Failed.`, error);
        return res.status(500).json({ error: "Internal error." });
    }

}


export const getRatingsByMarketId = async (req, res) => {
    /*  
        #swagger.tags = ['Ratings'] 
        #swagger.description = 'Endpoint to get all ratings of a specific market'
        #swagger.responses[200] = { 
            description: 'Ratings retrieved successfully', 
            schema: { 
                type: 'array',
                items: { $ref: '#/definitions/GetRating' } 
            }
        }
        #swagger.responses[404] = { description: 'No ratings found for this market.' }
        #swagger.responses[500] = { description: 'Internal error.' }
    */

    try {

        logger.info(`GET /ratings/markets/${req.params.id} received.`);

        const marketId = req.params.id;

        const marketRatings = await db.Rating.find({ market_id: marketId });
        if (marketRatings.length === 0) {
            logger.warn(`GET /ratings/market/${marketId} - No ratings found for market ${marketId}.`);
            return res.status(404).json({ error: `No ratings found for market ${marketId}.` });
        }

        logger.info(`GET /ratings/market/${marketId} - Retrieved ${marketRatings.length} ratings successfully.`);

        return res.status(200).json({
            message: `Ratings for market ${marketId} retrieved successfully.`,
            data: {
                marketRatings,
                averageRating: calculateRatingAverage(marketRatings),// calculate average rating 
            }
        });

    } catch (error) {
        logger.error(`GET /ratings/market/${marketId} - Failed.`, error);
        return res.status(500).json({ error: "Internal error." });
    }

};

export const createRating = async (req, res) => {
    /*  
        #swagger.tags = ['Ratings'] 
        #swagger.description = 'Endpoint to create a new rating'
        #swagger.parameters['body'] = { 
            in: 'body', 
            description: 'Object to create a rating', 
            required: true, 
            schema: { $ref: '#/definitions/CreateRating' } 
        } 
        #swagger.responses[201] = { 
            description: 'Rating created successfully', 
            schema: { $ref: '#/definitions/PostRating'} 
        } 
        #swagger.responses[400] = { description: "Invalid data."}
        #swagger.responses[401] = { description: "Unauthorized."}
        #swagger.responses[500] = { description: "Internal error."}
    */

    try {

        if (!req.user || !req.user.id) {
            logger.warn("POST /rating - Unauthorized attempt without req.user.");
            return res.status(401).json({ error: "Unauthorized. Please log in." });
        }

        const { market_id, rating, comment } = req.body;
        const user_id = req.user.id;

         if (!market_id || !rating) {
            logger.warn("POST /rating - Data not found.");
            return res.status(400).json({ error: "POST /rating - Data not found. Required fields: market id, rating." });
        }

        //---------------------- VALIDATE MARKET EXISTS ----------------------//

        try {
            const marketCheck = await axios.post(`http://${process.env.HOST}:${process.env.MARKETS_SERVICE_PORT}/`, {
                query: `
                    query {
                        market(id:"${market_id}") {
                            id
                        }
                    }`,
            });
            logger.info("Contacted Market Service to validate market existence 2.");

            if (!marketCheck.data.data.market) {
                logger.warn(`POST /rating - Market ${market_id} not found.`);
                return res.status(404).json({ error: `Market ${market_id} not found.` });
            }
        } catch (networkError) {
            logger.error("Could not contact Market Service:", networkError.message);
            return res.status(503).json({ error: "Unable to verify market. Please try again later.",debug: networkError.message });
        }


        const newRating = await db.Rating.create({
            user_id,
            market_id,
            rating,
            comment
        });

        logger.info("POST /rating - Created successfuly.")

        return res.status(201).json({
            message: "POST /rating - Created successfuly.",
            data: newRating
        });

    } catch (error) {
        logger.error("POST /rating - Failed.", error);
        return res.status(500).json({ error: "POST /rating - Failed." })
    }
};

export const updateRating = async (req, res) => {
    /*  
        #swagger.tags = ['Ratings'] 
        #swagger.description = 'Endpoint to update a rating by its Id'
        #swagger.parameters['body'] = { 
            in: 'body', 
            description: 'Object to update a rating', 
            required: true, 
            schema: { $ref: '#/definitions/CreateRating' } 
        }     
        #swagger.responses[200] = { 
            description: 'Rating updated successfully', 
            schema: { $ref: '#/definitions/GetRating'} 
        } 
        #swagger.responses[403] = { description: 'Access denied.' }
        #swagger.responses[404] = { description: 'Rating not found.' }
        #swagger.responses[500] = { description: 'Internal error.' }
    */

    try {

        logger.info(`PUT /ratings/${req.params.id} received.`);

        const ratingToUpdate = await db.Rating.findById(req.params.id);

        if (!ratingToUpdate) {
            logger.warn(`PUT /ratings/${req.params.id} - Not found.`);
            return res.status(404).json({ error: `Rating ${req.params.id} not found.` });
        }

        if (ratingToUpdate.user_id.toString() !== req.user.id) {
            logger.warn('Access denied!')
            return res.status(403).json({ error: "You are trying to update someone else's rate!" })
        }

        const { rating, comment } = req.body;

        if (rating !== undefined) ratingToUpdate.rating = rating;
        if (comment !== undefined) ratingToUpdate.comment = comment;

        const savedRating = await ratingToUpdate.save();

        logger.info(`PUT /ratings/${req.params.id} - Updated successfully.`);

        return res.status(200).json({
            message: `Rating ${req.params.id} updated successfully.`,
            data: savedRating
        });

    } catch (error) {
        logger.error(`PUT /ratings/${req.params.id} - Failed.`, error);
        return res.status(500).json({ error: "Internal error." });
    }
}

export const deleteRating = async (req, res) => {
    /*  
        #swagger.tags = ['Ratings'] 
        #swagger.description = 'Endpoint to delete a rating by its Id'
        #swagger.responses[204] = { description: 'No content' }
        #swagger.responses[403] = { description: 'Access denied.' }
        #swagger.responses[404] = { description: 'Rating not found.' }
        #swagger.responses[500] = { description: 'Internal error.' }
    */

    try {

        logger.info(`DELETE /ratings/${req.params.id} received.`);

        const rating = await db.Rating.findById(req.params.id);

        if (rating.user_id.toString() !== req.user.id && req.user.role !== "admin") {
            logger.warn('Access denied!')
            return res.status(403).json({ error: "You are trying to delete someone else's info!" })
        }

        if (!rating) {
            logger.warn(`DELETE /ratings/${req.params.id} - Not found.`);
            return res.status(404).json({ error: `Rating ${req.params.id} not found.` });
        }

        await db.Rating.findByIdAndDelete(req.params.id);
        logger.info(`DELETE /ratings/${req.params.id} - Deleted successfully.`);
        return res.status(204).json({ message: `Rating ${req.params.id} deleted successfully.` });

    } catch (error) {
        logger.error(`DELETE /ratings/${req.params.id} - Failed.`, error);
        return res.status(500).json({ error: "Internal error." });
    }
}


const calculateRatingAverage = (ratingsList) => {
    if (!ratingsList || ratingsList.length === 0) return 0;
    const sum = ratingsList.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = sum / ratingsList.length;

    return Number(avg.toFixed(1));
};
