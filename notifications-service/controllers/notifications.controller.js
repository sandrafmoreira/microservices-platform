const pino = require("pino");
const jwt = require('jsonwebtoken');
const logger = pino({
    transport: {
        target: "pino-pretty",
        options: {colorize: true}
    }
}) 

const mongoose = require('mongoose');

const Notification = require("../model/Notification");

exports.createNotification = async (req, res) => {
    /*  
        #swagger.tags = ['Notifications'] 
        #swagger.description = 'Endpoint to create a new notification'
        #swagger.parameters['body'] = { 
            in: 'body', 
            description: 'Object to create a notification', 
            required: true, 
            schema: { $ref: '#/definitions/CreateNotification' } 
        } 
        #swagger.responses[201] = { 
            description: 'Notification created successfully', 
            schema: { $ref: '#/definitions/GetNotification'} 
        } 
        #swagger.responses[400] = { description: "Invalid data."}
        #swagger.responses[500] = { description: "Internal error."}
    */

        try {

            const { user_id, type, content } = req.body;
            logger.info("POST /notifications received.");

            if (!user_id || !type || !content) {
                logger.warn("POST /notifications - Data not found.");
                return res.status(400).json({error: "POST /notifications - Data not found. Required fields: uer id, title, message."});
            } 

            const notification = await Notification.create({
                user_id,
                type,
                content
            });

            logger.info("POST /notifications - Created successfuly.")
            
            return res.status(201).json({
                message: "POST /notifications - Created successfuly.",
                data: notification
            });

        } catch (error) {
            logger.error("POST /notifications - Failed.", error);
            return res.status(500).json({error: "POST /notifications - Failed."})
        }
};

exports.getAllNotifications = async (req, res) => {
    /*  
        #swagger.tags = ['Notifications'] 
        #swagger.description = 'Endpoint to list all notifications'
        #swagger.responses[200] = { 
            description: 'All notifications retrieved successfully', 
            schema: { 
                type: 'array',
                items: { $ref: '#/definitions/GetNotification' } 
            }
        } 
        #swagger.responses[500] = { description: "Internal error."}
    */

    try {
        
        logger.info("GET /notifications received.");

        const notifications = await Notification.find();

        return res.status(200).json({
            message: "GET /notifications - Retrieved successfully.",
            data: notifications 
        });

    } catch (error) {
        logger.error("GET /notifications - Failed.", error);
        return res.status(500).json({error: "GET /notifications - Internal error."});
    }
};

exports.getNotificationById = async (req, res) => {
    /*  
        #swagger.tags = ['Notifications'] 
        #swagger.description = 'Endpoint to get a notification by its Id'
        #swagger.responses[200] = { 
            description: 'Notification retrieved successfully', 
            schema: { $ref: '#/definitions/GetNotification'} 
        } 
        #swagger.responses[404] = { description: "Notification not found." }
        #swagger.responses[500] = { description: "Internal error."}
    */

    try {
        
        logger.info(`GET /notifications/${req.params.id} received.`);

        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            logger.warn(`GET /notifications/${req.params.id} - Not found.`);
            return res.status(404).json({error: `GET /notifications/${req.params.id} - Not found.`});
        }
        
        logger.info(`GET /notifications/${req.params.id} - Retrieved successfully.`);

        return res.status(200).json({ 
            message: `GET /notifications/${req.params.id} - Retrieved successfully.`,
            data: notification
        })

    } catch (error) {
        logger.error(`GET /notifications/${req.params.id} - Failed.`, error);
        return res.status(500).json({error: `GET /notifications/${req.params.id} - Internal error.`});
    }
};

exports.getNotificationByUserId = async (req, res) => {
    /*  
        #swagger.tags = ['Notifications'] 
        #swagger.description = 'Endpoint to get all notifications of a specific user'
        #swagger.responses[200] = { 
            description: 'Notifications retrieved successfully', 
            schema: { 
                type: 'array',
                items: { $ref: '#/definitions/GetNotification' } 
            }
        }
        #swagger.responses[404] = { description: 'No notifications found for this user.' }
        #swagger.responses[500] = { description: 'Internal error.' }
    */

    try {
        
        logger.info(`GET /notifications/user/${req.params.userId} received.`);

        const userId = req.params.userId;

        const userNotifications = await Notification.find({user_id: userId});

        if (userNotifications.length === 0) {
            logger.warn(`GET /notifications/user/${userId} - No notifications found for user ${userId}.`);
            return res.status(404).json({ error: `No notifications found for user ${userId}.` });
        }

        logger.info(`GET /notifications/user/${userId} - Retrieved ${userNotifications.length} notifications successfully.`);

        return res.status(200).json({
            message: `Notifications for user ${userId} retrieved successfully.`,
            data: userNotifications
        });

    } catch (error) {
        logger.error(`GET /notifications/user/${userId} - Failed.`, error);
        return res.status(500).json({error: "Internal error."});
    }

}

exports.deleteNotification = async (req, res) => {
    /*  
        #swagger.tags = ['Notifications'] 
        #swagger.description = 'Endpoint to delete a notification by its Id'
        #swagger.responses[200] = { description: 'Notification deleted successfully.' }
        #swagger.responses[404] = { description: 'Notification not found.' }
        #swagger.responses[500] = { description: 'Internal error.' }
    */

    try {

        logger.info(`DELETE /notifications/${req.params.id} received.`);

        const index = await Notification.findByIdAndDelete(req.params.id);

        if (!index) {
            logger.warn(`DELETE /notifications/${req.params.id} - Not found.`);
            return res.status(404).json({error: `Notification ${req.params.id} not found.`});
        }

        logger.info(`DELETE /notifications/${req.params.id} - Deleted successfully.`);

        return res.status(200).json({
            message: `Notification ${req.params.id} deleted successfully.`
        });

    } catch (error) {
        logger.error(`DELETE /notifications/${req.params.id} - Failed.`, error);
        return res.status(500).json({ error: "Internal error." });
    }
}

