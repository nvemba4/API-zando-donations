const express = require('express');
const router = express.Router();
const validateDonation = require("../schemas/donationCamposSchema");

const {
  createDonations, getDonation, getDonationByUserId, updateStatus,
  getDonationFilter, getAlldonations, updateDonations ,deleteDonation
} = require('../controllers/donationsController');

// Registrar
router.post('/create',validateDonation, createDonations);
router.get('/list/:id', getDonation); 
router.get('/list/User/:id', getDonationByUserId);

router.put('/status/:id', updateStatus);
router.put('/update/:id', validateDonation, updateDonations);

router.get('/lists', getAlldonations);  
router.get('/lists/filter', getDonationFilter);   

router.delete('/delete/:id', deleteDonation);

// // Listar doações do usuário
// router.get('/my-donations', authenticate, getUserDonations);

// // Atualizar status da doação (pode ser usado pelo sistema quando a doação avança)
// router.patch('/:donationId/status', authenticate, updateDonationStatus);

module.exports = router;