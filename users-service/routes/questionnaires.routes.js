const express = require('express');
const router = express.Router();


// Controller functions
const auth_controller = require('../controllers/auth.controller.js');
const questionnaire_controller = require('../controllers/questionnaires.controller.js');

router.get('/:id', auth_controller.authenticateToken, questionnaire_controller.getQuestionnaireById);
router.post('/', questionnaire_controller.createQuestionnaire);
router.put('/:id', auth_controller.authenticateToken, questionnaire_controller.editQuestionnaire);
router.delete('/:id', auth_controller.authenticateToken, questionnaire_controller.deleteQuestionnaire);

module.exports = router;
