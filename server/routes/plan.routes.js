const express = require('express');
const router = express.Router();
const { createPlan, getAllPlans, updatePlan, deletePlan } = require('../controllers/plan.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, getAllPlans);
router.post('/', authMiddleware, createPlan);
router.put('/:id', authMiddleware, updatePlan);
router.delete('/:id', authMiddleware, deletePlan);

module.exports = router;
