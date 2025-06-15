const admin = require("firebase-admin");
const db = admin.firestore();

//  @route GET /impact_reports/:id

const getImpactReports = async (req, res) => {
  try {
    const impactreportRef = await db.collection('impact_reports').doc(req.params.id).get();

    if (!impactreportRef.exists) {
      return res.status(404).json({ error: 'status log não encontrada' });
    }

    res.json({
      impactreportId: impactreportRef.id,
      ...impactreportRef.data(),
    });
  } catch (error) {
    console.error('Erro ao buscar doação:', error);
    res.status(500).json({ error: error.message });
  }
};


// description Lista todas as doações de um usuário
const getStatusLogsByUserId = async (req, res) => {
  try {

    const donationDoc = await db.collection('donations').doc(req.params.id).get();

    if (!donationDoc.exists) {
      return res.status(404).json({ error: 'donation não encontrada' });
    }

    const snapShot = await db.collection('impact_reports')
      .where("centerInfo.donationId", "==", donationDoc.id)
      .get();


    if (snapShot.empty) {
      return res.status(404).json({ error: 'impact_reports não encontrado' });
    }

    const impact_reports = snapShot.docs.map(doc => ({
      logsId: doc.id,
      ...doc.data()
    }))

    res.json({
      impact_reports: impact_reports,
      length: impact_reports.length
    });
  } catch (error) {
    console.error('Erro ao buscar doação:', error);
    res.status(500).json({ error: error.message });
  }
};




const getAllimpact_reports = async (req, res) => {
  try {
    const { centerId, donationId } = req.query;
    let query =  db.collection('impact_reports');
    
    if (donationId) query = query.where("centerInfo.donationId", "==", donationId);
    if (centerId) query = query.where('centerId', '==',  centerId);
    
    const snapShot = await query.get();

    const impactReports = snapShot.docs.map((doc) => ({
      impactReportsId: doc.id,
      ...doc.data()
    }))
    

     res.json({
      impactReports:impactReports,
      length:impactReports.length
    });
  } catch (error) {
    console.error('Erro :', error);
    res.status(500).json({ error: error.message });
  }
};


const getimpact_reportsFilter = async (req, res) => {
  try {
    const { centerId, donationId } = req.query;
    let query =  db.collection('impact_reports');
    
      if (donationId) query = query.where("donationId", "==", donationId);
    if (centerId) query = query.where('centerInfo.centerId', '==',  centerId);

    const snapShot = await query.get();

    const impact_reports = snapShot.docs.map((doc) => ({
      donationId: doc.id,
      ...doc.data()
    }))
    

    res.json({
      impact_reports:impact_reports,
      length:impact_reports.length
    });
  } catch (error) {
    console.error('Erro :', error);
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  getimpact_reportsFilter,
  getAllimpact_reports,
  getStatusLogsByUserId,
  getImpactReports

};