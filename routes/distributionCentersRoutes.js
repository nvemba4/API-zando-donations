// const admin = require("firebase-admin");
// const db = admin.firestore();
const express = require('express');
const router = express.Router();

const {
  createCenter,
  getCenter,
  updateCenter,
  deleteCenter,
  listCenters,
  getCenterStats
} = require('../controllers/distributionCenterController');

const {
    updateStock, 
    listCenterDonations
} = require("../controllers/centerOperationsController");

const {
  verifyCenterAdmin
} = require("../middlewares/segurancaDistribuitionCenter");

// CRUD Básico
router.post('/create', createCenter);
router.get('/:id/list', getCenter);
router.put('/:id/update', updateCenter);
router.delete('/:id/delete', deleteCenter);

// Rotas Específicas
router.get('/all', listCenters);
router.get('/:id/states', getCenterStats);

// Rotas de Operações
router.patch('/:id/stock', updateStock);
router.get('/:id/donations', listCenterDonations);

// Aplicar nas rotas sensíveis:
// router.put('/:id', verifyCenterAdmin, updateCenter);
// router.delete('/:id', verifyCenterAdmin, deleteCenter);

module.exports = router;