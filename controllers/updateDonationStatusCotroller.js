const admin = require("firebase-admin");
const db = admin.firestore();
const { FieldValue } = require('firebase-admin/firestore');
const {
     getStore,createStatusLog,getDistributionCenter,handleDiscardedItems,
     generateImpactReport
} = require("./funcao-auxiliares-complemento");



/**
 * Atualiza o status de uma doação com todas as validações e operações relacionadas
 */
const updateDonationStatus = async (donationId, newStatus, userId, notes = '') => {
  const donationRef = db.collection('donations').doc(donationId);
  const transaction = db.runTransaction(async (t) => {
    const doc = await t.get(donationRef);
    if (!doc.exists) throw new Error('Doação não encontrada');

    const currentDonationId = doc.id;
    const currentData = doc.data();
    const currentStatus = currentData.status;
    const items = currentData.items;

  
    // Valida transição
    validateTransition(currentStatus, newStatus, items);

    

    // Prepara atualização
    const updateData = prepareStatusUpdate(newStatus, userId, notes);

    // busca o resultados de execução de todas Operações específicas por status
    const operations = await handleStatusSpecificOperations(newStatus, currentData, userId,currentDonationId);

    // Executa todas as operações na transaction
    t.update(donationRef, { ...updateData, ...operations.updateDonation });
    if (operations.createLog) t.create(db.collection('status_logs').doc(), operations.createLog);
    if (operations.createImpactReport) t.create(db.collection('impact_reports').doc(), operations.createImpactReport);
    if (operations.updateInventory) {
      operations.updateInventory.forEach(({ ref, data }) => t.update(ref, data));
    }

    return { newStatus, donationId };
  });

  return transaction;
};

/**
 * Valida se a transição entre estados é permitida
 */
const validateTransition = (currentStatus, newStatus, items) => {
  const validTransitions = {
    "Registrado": [ 'AguardandoColeta'],
    "AguardandoColeta": [ 'Coletado'],
    "Coletado": ['EmProcessamento'],
    "EmProcessamento": getProcessingDestinations(items),
    "DisponivelLoja": ['Vendido'],
    "Vendido": ['ImpactoRegistrado'],
    "Entregue": ['ImpactoRegistrado'],
    "Descartado": []
  };

  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    throw new Error(`Transição inválida, estatus atual -> ${currentStatus} <- não é permitido  - ${newStatus}`);
  }
};

/**
 * Determina os destinos possíveis durante o processamento
 */
const getProcessingDestinations = (items) => {
  const destinations = ['Descartado'];
  if (items.some(i => i.category === 'roupa' && i.condition === "excelente")) destinations.push('DisponivelLoja');
  if (items.some(i => i.category === 'roupa' && i.condition === "regular")) destinations.push('Entregue');
  if (items.some(i => i.category === 'alimento')) destinations.push('Entregue');
  // if (items.some(i => i.condition === 'danificado'))destinations.push('Descartado');
  return destinations;
};

/**
 * Prepara os campos básicos de atualização
 */
const prepareStatusUpdate = (newStatus, userId, notes) => {
  const updateData = {
    status: newStatus,
    updatedAt: new Date().toISOString(),
    lastUpdatedByUserId: userId
  };

  if (notes) updateData.notes = notes;

  // Campos específicos por status
  const statusFields = {
    EmProcessamento: { processingStart: new Date().toISOString() },
    DisponivelLoja: { availableDate: new Date().toISOString() },
    Vendido: { soldDate: new Date().toISOString() },
    Entregue: { deliveryDate: new Date().toISOString() },
    ImpactoRegistrado: { impactRegisteredAt: new Date().toISOString() }
  };

  return { ...updateData, ...statusFields[newStatus] };
};

/**
 * handleStatusSpecificOperations -> Executa operações específicas para cada novo status
 */
const handleStatusSpecificOperations = async (newStatus, donationData, userId, currentDonationId) => {
  const operations = { updateDonation: {} };
  const { id, items } = donationData;

  switch (newStatus) {
      case 'DisponivelLoja':
        // getStore -> busca a loja disponivel para armazenamento de roupa
      operations.updateDonation.storeLocation = await getStore(items);
      operations.createLog = createStatusLog(currentDonationId, 'DisponivelLoja', userId, 'Itens disponibilizados na loja');
      break;

    case 'Entregue':
        // getDistributionCenter -> busca centro de distribuição para alimento
      const centerInfo = await getDistributionCenter(donationData);
      operations.updateDonation = { 
        ...operations.updateDonation,
        center: centerInfo,
        // deliveryProof: await uploadDeliveryProof(id) 
      };
      // cria createStatusLog historico
      operations.createLog = createStatusLog(currentDonationId, 'Entregue', userId, `Entregue no ${centerInfo.name}`);
      break;

    case 'Descartado':
      //  handleDiscardedItems -> registra items descartado
      operations.updateInventory = await handleDiscardedItems(id, items, userId);
      operations.createLog = createStatusLog(id, 'Descartado', userId, 'Item descartado');
      break;

    case 'ImpactoRegistrado':
        // generateImpactReport ->  Gera relatório de impacto completo
      operations.createImpactReport = await generateImpactReport(id, donationData);
      operations.createLog = createStatusLog(currentDonationId, 'ImpactoRegistrado', userId, 'Impacto registrado');
      break;

      // case 'Vendido':
      // operations.updateDonation.saleReceipt = generateReceipt(id, items);
      // operations.updateInventory = await updateStoreInventory(items, 'decrement');
      // operations.createLog = createStatusLog(id, 'Vendido', userId, 'Item vendido');
      break;
  }

  

  return operations;
};


// get  full donations lista informação completa da doaçao.

const getFullDonation = async (donationId) => {
  const donation = await db.collection('donations').doc(donationId).get();
  const [
    logs, 
    impact, 
    donor, 
    recipient
  ] = await Promise.all([
    db.collection('status_logs').where('donationId', '==', donationId).get(),
    db.collection('impact_reports').where('donationId', '==', donationId).get(),
    db.collection('users').doc(donation.data().donorId.split('/')[1]).get(),
    donation.data().recipient?.centerId 
      ? db.collection('distribution_centers').doc(donation.data().recipient.centerId).get()
      : Promise.resolve(null)
  ]);

  return {
    donations: [{...donation.data()}],
    history: logs.docs.map(doc => doc.data()),
    impactReport: impact.docs[0]?.data(),
    donorInfo: donor.data(),
    recipientInfo: recipient?.data()
  };
};


module.exports = {
  updateDonationStatus,
  getFullDonation
}