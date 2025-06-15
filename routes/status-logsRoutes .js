const express = require('express');
const router = express.Router();

const {
  getStatus_logsFilter,
  getAllstatus_logs,
  getStatusLogsByUserId,
  getStatus_Logs
} = require('../controllers/statusLogsController');

// 
router.get('/:id/list', getStatus_Logs); 
router.get('/:id/byUserId', getStatusLogsByUserId);

router.get('/lists', getAllstatus_logs);
router.get('/filter', getStatus_logsFilter);   


module.exports = router;