const admin = require("firebase-admin");
const db = admin.firestore();

const updateStock = async (req, res) => {
  try {
    const { action, items } = req.body;
    const centerRef = db.collection('distribution_centers').doc(req.params.id);

    const updates = {};
    const stockChange = action === 'add' ? 1 : -1;

    items.forEach(item => {
      updates[`stock.${item.category}`] = admin.firestore.FieldValue.increment(item.quantity * stockChange);
      updates.currentStock = admin.firestore.FieldValue.increment(item.quantity * stockChange);
    });

    await centerRef.update(updates);
    const updated = await centerRef.get();

    res.status(200).json({
      success: true,
      currentStock: updated.data().currentStock
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listCenterDonations = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const snapshot = await db.collection('donations')
      .where('recipient.centerId', '==', req.params.id)
      .orderBy('deliveryDate', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .get();

    const donations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      deliveryDate: doc.data().deliveryDate
    }));

    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
    updateStock, 
    listCenterDonations
}