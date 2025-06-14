 const createDonation = async (req, res) => {
   try {
     const userId = req.user.uid;  // Assume que o middleware de autenticação adiciona o usuário
    
     const donationData = {
       donorId: userId,
       ...req.body,
       status: 'registered',
       createdAt: new Date()
     };

     const donation = new Donation(donationData);
     const docRef = await donationsCollection.add(donation.toFirestore());
    
     res.status(201).json({
       success: true,
       message: 'Doação registrada com sucesso',
       donationId: docRef.id
     });
   } catch (error) {
     console.error('Erro ao criar doação:', error);
     res.status(500).json({
       success: false,
       message: 'Falha ao registrar doação',
       error: error.message
     });
   }
 };


 const getUserDonations = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const snapshot = await donationsCollection
      .where('donorId', '==', userId)
      .get();
    
    const donations = [];
    snapshot.forEach(doc => {
      donations.push(Donation.fromFirestore(doc));
    });
    
    res.status(200).json({
      success: true,
      donations
    });
  } catch (error) {
    console.error('Erro ao buscar doações:', error);
    res.status(500).json({
      success: false,
      message: 'Falha ao buscar doações',
      error: error.message
    });
  }
};

const updateDonationStatus = async (req, res) => {
  try {
    const { donationId } = req.params;
    const { status } = req.body;
    
    await donationsCollection.doc(donationId).update({ status });
    
    res.status(200).json({
      success: true,
      message: 'Status da doação atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({
      success: false,
      message: 'Falha ao atualizar status',
      error: error.message
    });
  }
};
