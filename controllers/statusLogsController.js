const admin = require("firebase-admin");
const db = admin.firestore();

//  @route GET /status_logs/:id

const getStatus_Logs = async (req, res) => {
  try {
    const logsRef = await db.collection('status_logs').doc(req.params.id).get();

    if (!logsRef.exists) {
      return res.status(404).json({ error: 'status log não encontrada' });
    }

    res.json({
      logsId: logsRef.id,
      ...logsRef.data(),
    });
  } catch (error) {
    console.error('Erro ao buscar doação:', error);
    res.status(500).json({ error: error.message });
  }
};


// description Lista todas as doações de um usuário
const getStatusLogsByUserId = async (req, res) => {
  try {

    const userDoc = await db.collection('users').doc(req.params.id).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'usuario não encontrada' });
    }

    const snapShot = await db.collection('status_logs')
      .where("changedBy", "==", userDoc.id)
      .get();


    if (snapShot.empty) {
      return res.status(404).json({ error: 'status_logs não encontrado' });
    }

    const status_logs = snapShot.docs.map(doc => ({
      logsId: doc.id,
      ...doc.data()
    }))

    res.json({
      status_logs: status_logs,
      length: status_logs.length
    });
  } catch (error) {
    console.error('Erro ao buscar doação:', error);
    res.status(500).json({ error: error.message });
  }
};




const getAllstatus_logs = async (req, res) => {
  try {
    const { status, userId } = req.query;
    let query =  db.collection('status_logs');
    
    if (status) query = query.where('status', '==', status);
    if (userId) query = query.where('changedBy', '==',  userId);
    
    const snapShot = await query.get();

    const status_logs = snapShot.docs.map((doc) => ({
      logsId: doc.id,
      ...doc.data()
    }))
    

     res.json({
      status_logs:status_logs,
      length:status_logs.length
    });
  } catch (error) {
    console.error('Erro :', error);
    res.status(500).json({ error: error.message });
  }
};


const getStatus_logsFilter = async (req, res) => {
  try {
    const { status, userId, donationId, donationType,updatedAt,createdAt} = req.query;
    let query =  db.collection('status_logs');
    
    if (status) query = query.where('status', '==', status);
    if (userId) query = query.where('changedBy', '==',  userId);
    if (donationId) query = query.where('donationId', '==', donationId);

    const snapShot = await query.get();

    const status_logs = snapShot.docs.map((doc) => ({
      donationId: doc.id,
      ...doc.data()
    }))
    

    res.json({
      status_logs:status_logs,
      length:status_logs.length
    });
  } catch (error) {
    console.error('Erro :', error);
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  getStatus_logsFilter,
  getAllstatus_logs,
  getStatusLogsByUserId,
  getStatus_Logs

};