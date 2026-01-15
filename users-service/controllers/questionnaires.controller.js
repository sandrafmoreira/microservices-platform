const db = require('../models/db.js');
const pino = require("pino");
const jwt = require("jsonwebtoken");
const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {colorize: true}
  }
})

require('dotenv').config();

// Get questionnaire info by ID
exports.getQuestionnaireById = async(req, res) => {
    /*  
    #swagger.tags = ['Questionnaires'] 
    #swagger.responses[200] = { description: 'Questionnaire found successfully', schema: { $ref: '#/definitions/GetQuestionnaire'} } 
    #swagger.responses[401] = { description: 'No access token provided'}
    #swagger.responses[403] = { description: 'You are not allowed to access this endpoint' }
    #swagger.responses[404] = { description: 'Questionnaire was not found' } 
    #swagger.responses[500] = { description: 'Failed to fetch Questionnaires'}
    */
   logger.info(`Request: GET /users/questionnaires/${req.params.id} received!`);

    if (req.params.id !== req.user.id && req.user.role !== "admin") {
            logger.warn('Access denied!')
            return res.status(403).json({ error: "You are trying to access someone else's info!"})
        }

   try {
        const questionnaire = await db.Questionnaire.find({user_id: req.params.id})
            .select('-__v -_id')
            // .populate([
            //     {
            //         path: "product_type_id",
            //         select: "-_id -__v"
            //     }
            // ])
            .exec();

        if (!questionnaire) {
            logger.warn(`Questionnaire with ID ${req.params.id} was not found!`);
            return res.status(404).json({ error: 'Questionnaire not found' }); 
        } 

        logger.info(`Questionnaire with ID ${req.params.id} returned successfully.`)
        return res.status(200).json({
            "Questionnaire:": questionnaire
        })
   } catch (err) {
        logger.error(`Error fetching questionnaire with ID: ${req.params.id}`)
        res.status(500).json({ error: `Failed to fetch questionnaire: ${err.message}`});
   }
}


// Creates a new questionnaire row
exports.createQuestionnaire = async(req, res) => {
     /*
    #swagger.tags = ['Questionnaires'] 
    #swagger.parameters['body'] = { 
    in: 'body', 
    description: 'New questionnaire object', 
    required: true, 
    schema: { $ref: '#/definitions/CreateQuestionnaire' } 
    } 
    #swagger.responses[201] = { description: 'Questionnaire created successfully', schema: { $ref: '#/definitions/CreateQuestionnaire'} } 
    #swagger.responses[400] = { description: 'Current location field is missing.' }
    #swagger.responses[500] = { description: 'Failed to fetch Questionnaires.' }
     */

    try {
        logger.info(`Request: POST /users/questionnaires received!`);
        
        // add product_type_id
        const { user_id, current_location } = req.body;

        if (current_location === undefined) {
            logger.warn('Current location field is required!')
            return res.status(400).json({ error: 'Current location field is missing.'})
        }

        const new_questionnaire = new db.Questionnaire({ user_id, current_location })
        await new_questionnaire.save();

        logger.info(`New questionnaire successfully created!`)

        return res.status(201).json({ msg: 'Questionnaire successfully created!', "Questionnaire": new_questionnaire})
    } catch (err) {
        logger.error('Error creating questionnaire')
        res.status(500).json({ error: `Failed to create a new questionnaire: ${err.message}`});
    }
}


// Edits info in a questionnaire
exports.editQuestionnaire = async(req, res) => {
     /*
    #swagger.tags = ['Questionnaires'] 
    #swagger.parameters['body'] = { 
    in: 'body', 
    description: 'New questionnaire object', 
    required: true, 
    schema: { $ref: '#/definitions/CreateQuestionnaire' } 
    } 
    #swagger.responses[201] = { description: 'Questionnaire created successfully', schema: { $ref: '#/definitions/CreateQuestionnaire'} } 
    #swagger.responses[400] = { description: 'Current location field is missing.' }
    #swagger.responses[401] = { description: 'No access token provided'}
    #swagger.responses[403] = { description: 'You are not allowed to access this endpoint' }
    #swagger.responses[404] = { description: 'Questionnaire was not found' } 
    #swagger.responses[500] = { description: 'Failed to fetch questionnaires.' }
     */

    try {
        logger.info(`Request PUT /users/questionnaires/${req.params.id} received!`)

        const { current_location } = req.body;

        if (req.params.id !== req.user.id && req.user.role !== "admin") {
            logger.warn('Access denied!')
            return res.status(403).json({ error: "You are trying to access someone else's info!"})
        }

        if (current_location === undefined) {
            logger.warn('Current location field is required!')
            return res.status(400).json({ error: 'Current location field is missing.'})
        }

        let result = await db.Questionnaire.findOne({ user_id: req.params.id }).updateOne({ current_location })
        
        if (result === 0) {
            return res.status(404).json({errorMessage: `Cannot find any questionnaire from user with ID ${req.params.id}`})
        }
        
        res.status(201).json({ msg: "Info successfully updated"})
    } catch (err) {
        logger.error('Error editing a questionnaire')
        res.status(500).json({ error: `Failed to edit a questionnaire: ${err.message}`});
    }
}


// Deletes a questionnaire 
exports.deleteQuestionnaire = async(req, res) => {
     /*
    #swagger.tags = ['Questionnaires'] 
    #swagger.parameters['body'] = { 
    in: 'body', 
    description: 'New questionnaire object', 
    required: true, 
    schema: { $ref: '#/definitions/CreateQuestionnaire' } 
    } 
    #swagger.responses[201] = { description: 'Questionnaire created successfully', schema: { $ref: '#/definitions/CreateQuestionnaire'} } 
    #swagger.responses[401] = { description: 'No access token provided'}
    #swagger.responses[403] = { description: 'You are not allowed to access this endpoint' }
    #swagger.responses[404] = { description: 'Questionnaire was not found' } 
    #swagger.responses[500] = { description: 'Failed to fetch questionnaires.' }
     */
    try {
        logger.info(`Request DELETE /users/questionnaires/${req.params.id} received!`)

        if (req.params.id !== req.user.id && req.user.role !== "admin") {
            logger.warn('Access denied!')
            return res.status(403).json({ error: "You are trying to access someone else's info!"})
        }

        let result = await db.Questionnaire.findOne({ user_id: req.params.id }).deleteOne();

        if (result === 0) {
            logger.warn(`Cannot find any questionnaire with ID ${req.params.id}`)
            return res.status(404).json({errorMessage: `Cannot find any questionnaire from user with ID ${req.params.id}`})
        }

        res.status(200).json({msg: `Questionnaire from user ${req.params.id} successfully removed!`})
    } catch (err) {
        logger.error('Error deleting questionnaire')
        res.status(500).json({ error: `Failed to delete a questionnaire: ${err.message}`});
    }
}