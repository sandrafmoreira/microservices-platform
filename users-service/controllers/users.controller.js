const db = require('../models/db.js');
const pino = require("pino");
const axios = require('axios');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {colorize: true}
  }
}) 

require('dotenv').config();


// GET all users
/*⚠️ 
- fetch other services if necessary
- check other errors
*/
exports.getAllUsers = async(req, res) => {
    /*  
    #swagger.tags = ['Users'] 
    #swagger.responses[200] = { description: 'Users found successfully', schema: { $ref: '#/definitions/GetUser'} } 
    #swagger.responses[400] = { description: 'Order must be ascending or descending!'}
    #swagger.responses[401] = { description: 'No access token provided'}
    #swagger.responses[403] = { description: 'You are not allowed to access this endpoint' }
    #swagger.responses[404] = { description: 'Users not found' }
    #swagger.responses[500] = { description: 'Failed to fetch users'}
    */
    try {
        logger.info(`Request: GET /users received!`);

        const { page = 1, limit = 6, order = 'asc' } = req.query;         

        if (order !== 'asc' && order !== 'desc') {
            logger.error(`Invalid order parameter!`);
            return res.status(400).json({msg: "Order must be ascending or descending!"})
        }

        logger.info(`Calling Users Service: GET /users`)

        const users = await db.User.find()
            .select("-__v -admin")
            .skip((page - 1) * limit)
            .sort({'full_name': order === 'asc' ? 1 : -1})
            .limit(Number(limit))
            .exec();

        if (users.length === 0) {
            logger.warn(`No users were found!`)
            res.status(404).json({ error: "No users were found!"})
        } else {
            logger.info(`Users returned sucessfully.`)
            return res.status(200).json({
                "Users:": users
            })
        }
    } catch (err) {
        logger.error(`Error fetching users: ${err.message}`)
        res.status(500).json({ msg: "Failed to fetch users"});
    }
    
}


// GET an user by ID 
exports.getUserById = async(req, res) => {
    /*  
    #swagger.tags = ['Users'] 
    #swagger.responses[200] = { description: 'User found successfully', schema: { $ref: '#/definitions/GetUser'} } 
    #swagger.responses[401] = { description: 'No access token provided'}
    #swagger.responses[403] = { description: 'You are not allowed to access this endpoint' }
    #swagger.responses[404] = { description: 'User was not found' } 
    #swagger.responses[500] = { description: 'Failed to fetch users'}
    */
    logger.info(`Request: GET /users/${req.params.id} received!`);

    const user = await db.User.findById(req.params.id)
        .select("-__v")
        .exec();
    
    if (req.params.id !== req.user.id && req.user.role !== "admin") {
        logger.warn('Access denied!')
        return res.status(403).json({ error: "You are trying to access someone else's info!"})
    }

    if (!user) {
        logger.warn(`User with ID ${req.params.id} was not found!`);
        return res.status(404).json({ error: 'User not found' }) 
    }

    try {
        logger.info(`User with ID ${req.params.id} returned successfully.`)

        if (user.role === 'seller') {
            try {
                const seller_response = await axios.get(`http://localhost:3000/users/sellers/${req.params.id}`, {
                    headers: {
                        Authorization: req.headers.authorization 
                    }
                });
                seller = seller_response.data;

                logger.info(`Seller with ID ${req.params.id} returned successfully.`);

                return res.status(200).json({ "User": user, seller})
            } catch (err) {
                logger.error(`Failed to create a new seller for user ${user._id}`);
                res.status(500).json({ error: `Failed to create a new seller: ${err.message}`});
            }
        } else {
            try {
                const questionnaire_response = await axios.get(`http://localhost:3000/users/questionnaires/${req.params.id}`, {
                    headers: {
                        Authorization: req.headers.authorization 
                    }
                });
                questionnaire = questionnaire_response.data;

                logger.info(`Questionnaire with ID ${req.params.id} returned successfully.`);

                return res.status(200).json({ "User": user, questionnaire})
            } catch (err) {
                logger.error(`Failed to create a new questionnaire for user ${user._id}`);
                res.status(500).json({ error: `Failed to create a new questionnaire: ${err.message}`});
            }
        }
        
    } catch (err) {
        logger.error(`Error fetching user with ID: ${req.params.id}`)
        res.status(500).json({ error: `Failed to fetch user: ${err.message}`});
    }
}


// Create a new user
exports.register = async(req, res) => {
    /*
    #swagger.tags = ['Users'] 
    #swagger.parameters['body'] = { 
    in: 'body', 
    description: 'New user object', 
    required: true, 
    schema: { $ref: '#/definitions/CreateUser' } 
    } 
    #swagger.responses[201] = { description: 'User created successfully', schema: { $ref: '#/definitions/CreateUser'} } 
    #swagger.responses[400] = { description: 'All fields are required.' }
    #swagger.responses[409] = { description: 'Email already exists' } 
    #swagger.responses[500] = { description: 'Failed to fetch users'}
    #
     */
    try {
        logger.info(`Request: POST /register received!`);

        const { name, email, role, password, description, avatar, current_location} = req.body;
        
        // Check if any fields are missing
        let missing_fields = [];
        if ( name === undefined ) missing_fields.push('name');
        if ( role === undefined ) missing_fields.push('role');
        if (password === undefined ) missing_fields.push('password')
        if ( email === undefined ) missing_fields.push('email');

        if ( missing_fields.length > 0 ) {
            logger.warn(`All fields are required!`);
            return res.status(400).json({ error: `Missing fields: ${missing_fields.join(', ')}`})
        }

        if (role === 'buyer' && current_location === undefined) {
            return res.status(400).json({ error: `Current location is missing!`})
        } else if (role === 'seller' && description === undefined) {
            return res.status(400).json({ error: `Description is missing!`})
        }

        const existing_user = await db.User.findOne({ email }).exec();

        if (existing_user) {
            logger.warn('Email is already being used!')
            return res.status(409).json({ error: "Email is already being used"});
        }

        const new_user = new db.User({full_name: name, email, role, password: bcrypt.hashSync(password, 10)})
        await new_user.save();

        logger.info(`New user successfully created!`)

        if (role === 'seller') {
            try {
                const seller_response = await axios.post('http://localhost:3000/users/sellers', 
                    { user_id: new_user._id, description, avatar }
                );
                logger.info(`Seller created successfully for user ${new_user._id}`);

                seller = seller_response.data;
                return res.status(201).json({ msg: `Seller successfully created! `, "User": new_user, seller})
            } catch (err) {
                logger.error(`Failed to create a new seller for user ${new_user._id}`);
                res.status(500).json({ error: `Failed to create a new seller: ${err.message}`});
            }

        } else {
           try {
                const questionnaire_response = await axios.post('http://localhost:3000/users/questionnaires',
                    { user_id: new_user._id, current_location}
                );

                logger.info(`Questionnaire created successfully for  user ${new_user._id}`);

                questionnaire = questionnaire_response.data;
                return res.status(201).json({ msg: `Questionnaire successfully created! `, "User": new_user, questionnaire})
           } catch (err) {
                logger.error(`Failed to create a new questionnaire for user ${new_user._id}`);
                res.status(500).json({ error: `Failed to create a new questionnaire: ${err.message}`});
           }
        }
    } catch (err) {
        logger.error(`Error creating user`)
        res.status(500).json({ error: `Failed to create a new user: ${err.message}`});
    }
}


// Login user
exports.login = async(req, res) => {
    /*  
    #swagger.tags = ['Users'] 
    #swagger.responses[200] = { description: 'User found successfully', schema: { $ref: '#/definitions/GetUser'} } 
    #swagger.responses[401] = { description: 'Invalid Credentials' } 
    #swagger.responses[404] = { description: 'Cannot find any user with the written email!' }
    #swagger.responses[500] = { description: 'Failed to fetch user'}
    */
    try {
        logger.info(`Request: POST /login received!`);
        
        const { email, password } = req.body;

        let missingFields = [];

        if (email === undefined) missing_fields.push("Email");
        if (password === undefined) missingFields.push("Password")
        // # --> Check password in DB

        let user = await db.User.findOne(
            {"email": email})
            .select("-__v")
            .exec();

        if (!user) {
            logger.warn(`User not found!`);
            return res.status(404).json({ error: `Cannot find any user with email ${email}`})
        }

        const check = bcrypt.compareSync(password, user.password);
        if (!check) return res.status(401).json({success: false, acessToken: null, msg: "Invalid credentials!"})

        // JWT Token
        const token = jwt.sign({
        id: user._id,
        role: user.admin ? "admin" : "user"}, process.env.JWT_SECRET, { expiresIn: "24h" })

        logger.info(`User with ID ${user.id} returned sucessfully.`)

        res.status(200).json({
            msg: "Logged in successfully",
            user: user,
            accessToken: token
        })
    } catch (err) {
        logger.error(`Error creating user`)
        res.status(500).json({ error: "Failed to fetch user"});
    }
}


// Update info from an user
exports.updateInfo = async(req, res) => {
    /*  
    #swagger.tags = ['Users'] 
    #swagger.parameters['body'] = { 
    in: 'body', 
    description: 'Update an user', 
    required: true, 
    schema: { $ref: '#/definitions/GetUser' } 
    } 
    #swagger.responses[201] = { description: 'User info updated successfully', schema: { 
    $ref: '#/definitions/GetUser'} } 
    #swagger.responses[401] = { description: 'No access token provided' }
    #swagger.responses[403] = { description: 'You are not allowed to access this endpoint' }
    #swagger.responses[404] = { description: 'User not found' } 
    #swagger.responses[409] = { description: 'Email already exists' } 
    #swagger.responses[500] = { description: 'Failed to fetch users'}
    */
    try {
        logger.info(`Request: PUT /users/${req.params.id} received!`);

        const { name, email, password, description, avatar, current_location, alert} = req.body;

        if (req.params.id !== req.user.id && req.user.role !== "admin") {
            logger.warn('Access denied!')
            return res.status(403).json({ error: "You are trying to access someone else's info!"})
        }

        // Check if any fields are missing
        let missing_fields = [];
        if ( name === undefined ) missing_fields.push('name');
        if (password === undefined ) missing_fields.push('password')
        if ( email === undefined ) missing_fields.push('email');

        if ( missing_fields.length > 0 ) {
            logger.warn(`All fields are required!`);
            return res.status(400).json({ error: `Missing fields: ${missing_fields.join(', ')}`})
        }

        const existing_user = await db.User.findOne({ email }).exec();

        if (existing_user) {
            logger.warn('Email is already being used!')
            return res.status(409).json({ error: "Email is already being used"});
        }

        let result = await db.User.findByIdAndUpdate(req.params.id, {full_name: name, email, password: bcrypt.hashSync(password, 10)})

        logger.info(`User with ID ${req.params.id} edited successfully.`)

        if (result === 0) {
            return res.status(404).json({errorMessage: `Cannot find any questionnaire from user with ID ${req.params.id}`})
        }

        const user = await db.User.findById(req.params.id)
            .select('-__v')
            .exec();

        logger.info(`User with ID ${req.params.id} returned successfully.`)

        if (user.role === 'buyer' && current_location === undefined) {
            return res.status(400).json({ error: `Current location is missing!`})
        } else if (user.role === 'seller' && description === undefined) {
            return res.status(400).json({ error: `Description is missing!`})
        }

        if (user.role === 'seller') {
            try {
                const seller_response = await axios.put(`http://localhost:3000/users/sellers/${req.params.id}`, 
                    { description, avatar, alert },
                    { headers: { Authorization: req.headers.authorization }}
                );
                seller = seller_response.data;

                logger.info(`Seller with ID ${req.params.id} returned successfully.`);

                return res.status(201).json({ "User": user, seller})
            } catch (err) {
                logger.error(`Failed to edit the seller for the user ${user._id}`);
                res.status(500).json({ error: `Failed to edit the seller for the user: ${err.message}`});
            }
        } else {
            try {
                const questionnaire_response = await axios.put(`http://localhost:3000/users/questionnaires/${req.params.id}`,
                    { current_location },
                    { headers: { Authorization: req.headers.authorization }}
                );
                questionnaire = questionnaire_response.data;

                logger.info(`Questionnaire with ID ${req.params.id} returned successfully.`);

                return res.status(201).json({ "User": user, questionnaire})
            } catch (err) {
                logger.error(`Failed to edit questionnaire for the user ${user._id}`);
                res.status(500).json({ error: `Failed to edit questionnaire for the user: ${err.message}`});
            }
        }
    } catch (err) {
        logger.error(`Error updating user`)
        res.status(500).json({ error: `Failed to update the user's info: ${err.message}`});
    }
}


// Delete an user
exports.deleteUser = async(req, res, next) => {
    /*  
    #swagger.tags = ['Users'] 
    #swagger.responses[204] = { description: 'User deleted successfully'} 
    #swagger.responses[401] = { description: 'No access token provided' }
    #swagger.responses[403] = { description: 'You are not allowed to access this endpoint' }
    #swagger.responses[404] = { description: 'User not found' } 
    #swagger.responses[500] = { description: 'Failed to fetch users'}
  */
    logger.info(`Request: DELETE /users/${req.params.id} received!`);

    if (req.params.id !== req.user.id && req.user.role !== "admin") {
        logger.warn('Access denied!')
        return res.status(403).json({ error: "You are trying to access someone else's info!"})
    }

    try {        
        const user = await db.User.findById(req.params.id)
            .select('-__v')
            .exec();

        logger.info(`User with ID ${req.params.id} found successfully.`)

        const result = await db.User.findByIdAndDelete(req.params.id);

        if (result === 0) {
            logger.warn(`User not found!`);
            return res.status(404).json({ error: "User not found" });
        }

        logger.info(`User with ID ${req.params.id} deleted successfully.`)


        if (user.role === 'seller') {
            try {
                const seller_response = await axios.delete(`http://localhost:3000/users/sellers/${req.params.id}`, 
                    { headers: { Authorization: req.headers.authorization }}
                );
                seller = seller_response.data;

                logger.info(`Seller with ID ${req.params.id} removed successfully.`);

                 return res.status(204).json({ msg: "User successfully removed "})
            } catch (err) {
                logger.error(`Failed to remove the seller with user ID ${user._id}`);
                res.status(500).json({ error: `Failed to remove the seller with user ID: ${err.message}`});
            }
        } else {
            try {
                const questionnaire_response = await axios.delete(`http://localhost:3000/users/questionnaires/${req.params.id}`,
                    { headers: { Authorization: req.headers.authorization }}
                );
                questionnaire = questionnaire_response.data;

                logger.info(`Questionnaire with ID ${req.params.id} removed successfully.`);

                 return res.status(204).json({ msg: "User successfully removed "})
            } catch (err) {
                logger.error(`Failed to remove questionnaire for the user ${user._id}`);
                res.status(500).json({ error: `Failed to remove questionnaire for the user: ${err.message}`});
            }
        }
    } catch (err) {
        logger.error(`Error updating user`)
        res.status(500).json({ error: `Failed to update the user's info: ${err.message}`});
    }
}