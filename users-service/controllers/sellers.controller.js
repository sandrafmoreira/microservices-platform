const db = require('../models/db.js');
const pino = require("pino");
const jwt = require("jsonwebtoken");
const logger = pino({
    transport: {
        target: "pino-pretty",
        options: { colorize: true }
    }
})

require('dotenv').config();

// GET a seller by ID
exports.getSellerById = async (req, res) => {
    /*  
    #swagger.tags = ['Sellers'] 
    #swagger.responses[200] = { description: 'Seller found successfully', schema: { $ref: '#/definitions/GetSeller'} } 
    #swagger.responses[401] = { description: 'No access token provided'}
    #swagger.responses[403] = { description: 'You are not allowed to access this endpoint' }
    #swagger.responses[404] = { description: 'Seller was not found' } 
    #swagger.responses[500] = { description: 'Failed to fetch seller'}
    */
    try {
        logger.info(`Request: GET users/sellers/${req.params.id} received!`);

        // if (req.params.id !== req.user.id && req.user.role !== "admin") {
        //         logger.warn('Access denied!')
        //         return res.status(403).json({ error: "You are trying to access someone else's info!"})
        // }

        // const seller = await db.Seller.findOne({ user_id: req.params.id })
     
        const seller = await db.Seller.findById(req.params.id) 
            .select("-__v -_id") 
            .populate({
                path: "user_id",
                select: 'full_name email'
            })
            .exec();

        if (!seller) {
            logger.warn(`Seller with ID ${req.params.id} was not found!`);
            return res.status(404).json({ error: 'Seller not found' });
        }

        logger.info(`Seller with user ID ${req.params.id} returned successfully.`)
        return res.status(200).json({
            // "Seller:": seller
            id: req.params.id,
            full_name: seller.user_id?.full_name,
            email: seller.user_id?.email,
            description: seller.description,
            avatar: seller.avatar
        })
    } catch (err) {
        logger.error(`Error fetching seller info from user with ID: ${req.params.id}`)
        res.status(500).json({ error: `Failed to fetch seller: ${err.message}` });
    }
}

// Create a new seller
exports.createSeller = async (req, res) => {
    /*
    #swagger.tags = ['Sellers'] 
    #swagger.parameters['body'] = { 
    in: 'body', 
    description: 'New seller object', 
    required: true, 
    schema: { $ref: '#/definitions/CreateSeller' } 
    } 
    #swagger.responses[201] = { description: 'Seller created successfully', schema: { $ref: '#/definitions/CreateSeller'} } 
    #swagger.responses[400] = { description: 'Description field is missing.' }
    #swagger.responses[500] = { description: 'Failed to fetch sellers.' }
    #
     */
    try {
        logger.info(`Request: POST /users/sellers received!`);

        // add product_type_id
        const { user_id, description, avatar } = req.body;

        if (description === undefined) {
            logger.warn('Description field is required!')
            return res.status(400).json({ error: 'Description field is missing.' })
        }

        const new_seller = new db.Seller({ user_id, description, avatar })
        await new_seller.save();

        logger.info(`New seller successfully created!`)

        return res.status(201).json({ msg: 'Seller successfully created!', "Seller": new_seller })

    } catch (err) {
        logger.error('Error creating seller')
        res.status(500).json({ error: `Failed to create a new seller: ${err.message}` });
    }
}


// Edits a seller's info
exports.editSeller = async (req, res) => {
    /*
    #swagger.tags = ['Sellers'] 
    #swagger.parameters['body'] = { 
    in: 'body', 
    description: 'New seller object', 
    required: true, 
    schema: { $ref: '#/definitions/CreateSeller' } 
    } 
    #swagger.responses[201] = { description: 'Seller created successfully', schema: { $ref: '#/definitions/CreateSeller'} } 
    #swagger.responses[400] = { description: 'Description field is missing.' }
    #swagger.responses[401] = { description: 'No access token provided'}
    #swagger.responses[403] = { description: 'You are not allowed to access this endpoint' }
    #swagger.responses[404] = { description: 'Seller was not found' } 
    #swagger.responses[500] = { description: 'Failed to fetch Sellers.' }
     */
    try {
        logger.info(`Request: PUT users/sellers/${req.params.id} received!`);

        // add product_type_id
        const { description, avatar, alert } = req.body;

        let result = await db.Seller.findOne({ user_id: req.params.id }).updateOne({ description, avatar, alert })

        if (result === 0) {
            return res.status(404).json({ errorMessage: `Cannot find any seller info from user with ID ${req.params.id}` })
        }

        res.status(201).json({ msg: "Info successfully updated" })
    } catch (err) {
        logger.error('Error editing a seller')
        res.status(500).json({ error: `Failed to edit a seller: ${err.message}` });
    }
}


// Deletes a seller
exports.deleteSeller = async (req, res) => {
    /*
    #swagger.tags = ['Sellers'] 
    #swagger.parameters['body'] = { 
    in: 'body', 
    description: 'New seller object', 
    required: true, 
    schema: { $ref: '#/definitions/CreateSeller' } 
    } 
    #swagger.responses[201] = { description: 'Seller created successfully', schema: { $ref: '#/definitions/CreateSeller'} } 
    #swagger.responses[401] = { description: 'No access token provided'}
    #swagger.responses[403] = { description: 'You are not allowed to access this endpoint' }
    #swagger.responses[404] = { description: 'Seller was not found' } 
    #swagger.responses[500] = { description: 'Failed to fetch Sellers.' }
     */
    try {
        logger.info(`Request DELETE /users/sellers/${req.params.id} received!`)

        let result = await db.Seller.findOne({ user_id: req.params.id }).deleteOne();

        if (result === 0) {
            logger.warn(`Cannot find any seller with ID ${req.params.id}`)
            return res.status(404).json({ errorMessage: `Cannot find any seller from user with ID ${req.params.id}` })
        }

        res.status(200).json({ msg: `Seller info from user ${req.params.id} successfully removed!` })
    } catch (error) {
        logger.error('Error deleting a seller')
        res.status(500).json({ error: `Failed to delete a seller: ${err.message}` });
    }
}

