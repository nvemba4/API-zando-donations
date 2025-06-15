const admin = require("firebase-admin");
const db = admin.firestore();

const {
//     uploadDeliveryProof,
// determineDisposalMethod,
calculateCO2Reduction,
// assignToStore,
calculateFamiliesHelped,
} = require("./funcoes-calculoUtilitarias");


/**
 * Atribui a loja com menor estoque para roupas
 */
const getStore = async (items) => {
  const clothingItems = items.filter(i => i.category === 'roupa');
  if (clothingItems.length === 0) return null;

  const storesRef = db.collection('stores');
  const snapshot = await storesRef
    .where('category', '==', 'roupa')
    // .orderBy('currentInventory', 'asc')
    .limit(1)
    .get();

  if (snapshot.empty) throw new Error('Nenhuma loja disponível');
  return {
    storeId: snapshot.docs[0].id,
    name: snapshot.docs[0].data().name,
    assignedAt: new Date().toISOString()
  };
};

/**
 * Atribui o destinatário para alimentos
 */
const getDistributionCenter = async (donation) => {
  const foodItems = donation.items.filter(i => i.category === 'alimento' ||  i.category === 'roupa');
  if (foodItems.length === 0) return null;

  const centersRef = db.collection('distribution_centers');
  const snapshot = await centersRef
    .where('capacity', '>', foodItems.length)
    .orderBy('capacity', 'asc')
    .limit(1)
    .get();

  if (snapshot.empty) throw new Error('Nenhum centro disponível');
  
  const centerData = snapshot.docs[0].data();
  return {
    centerId: snapshot.docs[0].id,
    name: centerData.name,
    address: centerData.address,
    manager: centerData.manager,
    contact: centerData.contact

  };
};

/**
 * Gera relatório de impacto completo
 */
const generateImpactReport = async (donationId, donationData) => {
  const impactMetrics = {
    familiesHelped: calculateFamiliesHelped(donationData.items),
    co2Reduction: calculateCO2Reduction(donationData.items),
    itemsDelivered: donationData.items.reduce((sum, item) => sum + item.quantity, 0)
  };

  return {
    donationId,
    generatedAt: new Date().toISOString(),
    metrics: impactMetrics,
    recipient: donationData.recipient,
    // photos: await getDeliveryPhotos(donationId),
    reportCode: `IMP-${donationId.slice(0, 5).toUpperCase()}`
  };
};

/**
 * Atualiza estoque ao vender ou descartar itens
 */
const updateStoreInventory = async (items, action) => {
  const operations = [];
  const storeRef = db.collection('stores').doc('main_store');

  for (const item of items) {
    if (item.category === 'clothing') {
      operations.push({
        ref: storeRef,
        data: {
          [`inventory.${item.name}`]: FieldValue[action === 'decrement' ? 'increment' : 'decrement'](-item.quantity)
        }
      });
    }
  }

  return operations;
};

/**
 * Registra itens descartados
 */
const handleDiscardedItems = async (donationId, items, userId) => {
  const batch = db.batch();
  const discardedRef = db.collection('discarded_items').doc();

  batch.set(discardedRef, {
    donationId,
    items: items.map(i => ({ id: i.id, name: i.name, reason: 'Danificado' })),
    discardedBy: userId,
    timestamp: new Date().toISOString(),
    // disposalMethod: determineDisposalMethod(items)
  });

  // Atualiza estoque se for roupa
  const inventoryUpdates = await updateStoreInventory(items, 'increment');
  inventoryUpdates.forEach(op => batch.update(op.ref, op.data));

  await batch.commit();
  return inventoryUpdates;
};


/**
 * Cria registro no histórico de status
 */
const createStatusLog = (donationId, status, userId, notes = '') => ({
  donationId,
  status,
  changedBy: userId,
  timestamp: new Date().toISOString(),
  notes,
  systemEvent: true
});



module.exports = {
handleDiscardedItems,
updateStoreInventory,
generateImpactReport,
// assignToStore,
getStore,
// assignRecipient,
getDistributionCenter,
createStatusLog
};