// Atualizar status
const express = require('express');
const router = express.Router();

const {
    validateStatusChange,
    authenticateAdmin,
} = require("../middlewares/validacao-Admin");

const { updateDonationStatus , getFullDonation } = require("../controllers/updateDonationStatusCotroller");

router.patch('/:donationId/status', 
  authenticateAdmin, 
  validateStatusChange, 
  async (req, res) => {
    try {
      const { donationId } = req.params;
      const { status, userId, notes,  } = req.body;
     
      const result = await updateDonationStatus(donationId, status, userId, notes);
      
      res.json({
        success: true,
        donationId: result.donationId,
        newStatus: result.newStatus,
        updatedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Status update error:', error.message);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Obter histórico de status
router.get('/:donationId/history', async (req, res) => {
  try{const snapshot = await db.collection('status_logs')
    .where('donationId', '==', req.params.donationId)
    .orderBy('timestamp', 'desc')
    .get();

  res.json(snapshot.docs.map(doc => doc.data()));
}catch(error){
   console.error('donationId/history:', error.message);
      res.status(400).json({
        success: false,
        error: error.message
      });
}
});



module.exports = router;