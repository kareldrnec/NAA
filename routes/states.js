const express = require('express');
const router = express.Router();
const auth = require('../auth');
const states_controller = require('../controllers/stateController');

// GET - add State
router.get('/addState/:id', auth.requiresLogin, states_controller.addState);

// POST - add State
router.post('/addState/:id', auth.requiresLogin, states_controller.postNewState);

module.exports = router;