const express = require('express');
const storeController = require('../controllers/storeController');

const router = express.Router();

router.post('/create', storeController.createStore);
router.get('/all', storeController.listStores);
router.get('/:id/list', storeController.getStore);
router.put('/:id/update', storeController.updateStore);

module.exports = router;