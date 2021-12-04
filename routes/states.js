const express = require('express');
const router = express.Router();
const auth = require('../auth');
const states_controller = require('../controllers/stateController');

// GET - add State
router.get('/addState/:id', auth.requiresLogin, states_controller.addState);

// POST - add State
router.post('/addState/:id', auth.requiresLogin, states_controller.postNewState);

// GET - edit State
router.get('/editState/:id', auth.requiresLogin, states_controller.getStateForEdit);

// POST - edit State
router.post('/editState/:id', auth.requiresLogin, states_controller.updateState);

// GET - delete State
router.get('/deleteState/:id', auth.requiresLogin, states_controller.deleteSelectedState);

module.exports = router;