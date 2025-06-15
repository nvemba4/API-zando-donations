const admin = require("firebase-admin");
const Donation = require('../models/donations');
const db = admin.firestore();


const createDonations = async (req, res) => {
  try {
    const {
      name,
      userId,
      donationType,
      items,
      status = "Registrado",
      pickupAddress,
      scheduledDate,
      specialNotes
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "missing required fields userId" });
    }

    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const danationsData = {
      name: name,
      userId: userDoc.id,
      donationType: donationType,
      items: [
        ...items
      ],
      status: status,
      pickupAddress: {
        street: pickupAddress.street,
        complement: pickupAddress.complement,
        city: pickupAddress.city,
      },
      scheduledDate: scheduledDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      specialNotes: specialNotes,
      updatedAt: new Date().toISOString(),
    };

    const donationRef = await db.collection("donations").add(danationsData);
    const donationId = donationRef.id;

    res.status(201).json({
      success: true,
      donationId: donationId,
      message: "Doação registrada com sucesso!",
      nextSteps: 'Aguardando agendamento da coleta'
    });
  } catch (error) {
    console.error('Erro ao criar doação:', error);
    res.status(500).json({ error: error.message });
  }
};

//  @route GET /donations/:id

const getDonation = async (req, res) => {
  try {
    const donationRef = await db.collection('donations').doc(req.params.id).get();

    if (!donationRef.exists) {
      return res.status(404).json({ error: 'Doação não encontrada' });
    }

    res.json({
      donationId: donationRef.id,
      ...donationRef.data(),
    });
  } catch (error) {
    console.error('Erro ao buscar doação:', error);
    res.status(500).json({ error: error.message });
  }
};


// description Lista todas as doações de um usuário
const getDonationByUserId = async (req, res) => {
  try {

    const userDoc = await db.collection('users').doc(req.params.id).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'usuario não encontrada' });
    }

    const snapShot = await db.collection('donations')
      .where("userId", "==", userDoc.id)
      .orderBy("createdAt", "desc")
      .get();


    if (snapShot.empty) {
      return res.status(404).json({ error: 'Doação não encontrada' });
    }

    const donations = snapShot.docs.map(doc => ({
      donorId: doc.id,
      ...doc.data()
    }))

    res.json({
      donations: donations,
      length: donations.length
    });
  } catch (error) {
    console.error('Erro ao buscar doação:', error);
    res.status(500).json({ error: error.message });
  }
};

// get  full donations lista informação completa da doaçao.

const getFullDonationInfo = async (donationId) => {
  const donation = await db.collection('donations').doc(donationId).get();
  const [
    logs, 
    impact, 
    donor, 
    center
  ] = await Promise.all([
    db.collection('status_logs').where('donationId', '==', donationId).get(),
    db.collection('impact_reports').where('donationId', '==', donationId).get(),
    db.collection('users').doc(donation.data().donorId.split('/')[1]).get(),
    donation.data().center?.centerId 
      ? db.collection('distribution_centers').doc(donation.data().center.centerId).get()
      : Promise.resolve(null)
  ]);

  return {
    donations: [{...donation.data()}],
    history: logs.docs.map(doc => doc.data()),
    impactReport: impact.docs[0]?.data(),
    donorInfo: donor.data(),
    centerInfo: center?.data()
  };
};

/**
 * @route PATCH /donations/:id/status
 * @description Atualiza o status de uma doação
 * @access Private (Admin)
 */
 const updateStatusField = async (req, res) => {
   try {
    //  const validStatuses = ['pendente', 'scheduled',
    //     'collectado', 'processado', 'distribuido', 'cancelado'];
    
    //  if (!validStatuses.includes(req.body.status)) {
    //    return res.status(400).json({ error: 'Status inválido' });
    //  }
    
        const  donationRef = db.collection('donations');
        const donationsData = await donationRef.doc(req.params.id).get();
       if (!donationsData.exists) {
       return res.status(404).json({ error: 'doação não encontrada' });
     }
         await donationRef.doc(req.params.id).update({
               status: req.body.status,
               updatedAt: new Date().toISOString()
            });

     res.json({ message: 'Status atualizado com sucesso' });
   } catch (error) {
     console.error('Erro ao atualizar status:', error);
     res.status(500).json({ error: error.message });
   }
 };


const getAlldonations = async (req, res) => {
  try {
    const { status, userId } = req.query;
    let query =  db.collection('donations');
    
    if (status) query = query.where('status', '==', status);
    if (userId) query = query.where('donorId', '==',  userId);
    
    const snapShot = await query.get();

    const donations = snapShot.docs.map((doc) => ({
      donationId: doc.id,
      ...doc.data()
    }))
    

     res.json({
      donations:donations,
      length:donations.length
    });
  } catch (error) {
    console.error('Erro :', error);
    res.status(500).json({ error: error.message });
  }
};


const getDonationFilter = async (req, res) => {
  try {
    const { status, userId, donationId, donationType,updatedAt,createdAt} = req.query;
    let query =  db.collection('donations');
    
    if (status) query = query.where('status', '==', status);
    if (userId) query = query.where('userId', '==',  userId);
    if (donationId) query = query.where('donationId', '==', donationId);
    if (donationType) query = query.where('donationType', '==',  donationType);
    if (updatedAt) query = query.where('updatedAt', '==',  updatedAt);
    if (createdAt) query = query.where('createdAt', '==',  createdAt);
     

    const snapShot = await query.get();

    const donations = snapShot.docs.map((doc) => ({
      donationId: doc.id,
      ...doc.data()
    }))
    

    res.json({
      donations:donations,
      length:donations.length
    });
  } catch (error) {
    console.error('Erro :', error);
    res.status(500).json({ error: error.message });
  }
};


const updateDonation = async (req, res) => {
  try {

      const donationRef = db.collection('donations');
      const donationsData = await donationRef.doc(req.params.id).get();

      if (!donationsData.exists) {
      return res.status(404).json({ error: 'doação não encontrada' });
    }
        await donationRef.doc(req.params.id).update({
              ...req.body,
              updatedAt: new Date().toISOString()
           });

     res.json({ message: 'Doação atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const deleteDonation = async (req, res) => {
  try {

     const donationRef = db.collection('donations');
      const donationsData = await donationRef.doc(req.params.id).get();

      if (!donationsData.exists) {
      return res.status(404).json({ error: 'doação não encontrada' });
    }
           await donationRef.doc(req.params.id).delete();

     res.json({ message: 'Doação deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Falha ao deletar' });
  }
};


module.exports = {
  createDonations,
  getDonation,
  getDonationByUserId,
  updateStatusField,
  getFullDonationInfo,
  getAlldonations,
  getDonationFilter,
  updateDonation,
  deleteDonation
};