const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth); // Protect all habit routes

router.get('/', habitController.getHabits);
router.post('/add', habitController.postAddHabit);
router.post('/edit/:id', habitController.postEditHabit);
router.post('/delete/:id', habitController.postDeleteHabit);
router.post('/log', habitController.postLogHabit); // AJAX endpoint

module.exports = router;
