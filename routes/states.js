const express = require('express');
const router = express.Router();
const auth = require('../auth');
const states_controller = require('../controllers/stateController');

// GET - add State
router.get('/add/:id', auth.requiresLogin, states_controller.addState);

// POST - add State
router.post('/add/:id', auth.requiresLogin, states_controller.postNewState);

// GET - edit State
router.get('/edit/:id', auth.requiresLogin, states_controller.getStateForEdit);

// POST - edit State
router.post('/edit/:id', auth.requiresLogin, states_controller.updateState);

// GET - delete State
router.get('/delete/:id', auth.requiresLogin, states_controller.deleteSelectedState);

module.exports = router;