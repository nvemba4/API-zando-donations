const express = require('express');
const router = express.Router();

const {
    getimpact_reportsFilter,
  getAllimpact_reports,
  getStatusLogsByUserId,
  getImpactReports
} = require('../controllers/impactReport');

// 
router.get('/:id/list', getImpactReports); 
router.get('/:id/byUserId', getStatusLogsByUserId);

router.get('/lists', getAllimpact_reports);
router.get('/filter', getimpact_reportsFilter);   


module.exports = router;