const express = require('express');
const router = express.Router();
const validateDonationSchema = require("../schemas/donationCamposSchema");

const {
  createDonations, getDonation, getDonationByUserId, 
   updateStatusField, 
  getFullDonationInfo,
  getDonationFilter, getAlldonations, updateDonation, deleteDonation
} = require('../controllers/donationsController');

// Registrar
router.post('/create',validateDonationSchema, createDonations);
router.put('/:id/update', validateDonationSchema, updateDonation);
router.get('/:id/list', getDonation); 
router.get('/:id/byUserId', getDonationByUserId);

 router.put('/status/:id', updateStatusField);

router.get('/lists', getAlldonations);
router.get('/filter', getDonationFilter);   
router.delete('/delete/:id', deleteDonation);


// 
router.get('/:id/fullDonationInfo', async (req, res) => {
    try {
       const result = await getFullDonationInfo(req.params.id);

       res.json({
        success: true,
        donations: result.donations,
        donorInfo: result.donorInfo ,
        history: result.history,
        impactReport: result.impactReport,
        recipientInfo: result.recipientInfo.Route,
        updatedAt: new Date().toISOString()
      });
    }  catch (error) {
      console.error('list donations  error:', error.message);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }

});
// // Listar doações do usuário
// router.get('/my-donations', authenticate, getUserDonations);

// // Atualizar status da doação (pode ser usado pelo sistema quando a doação avança)
// router.patch('/:donationId/status', authenticate, updateDonationStatus);

module.exports = router;