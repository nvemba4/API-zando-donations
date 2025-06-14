const admin = require("firebase-admin");
const db = admin.firestore();
const DistributionCenter = require('../models/distributionCenter');
const distributionCenterSchema = require('../schemas/distributionCenterSchema');

const createCenter = async (req, res) => {
  try {
    const { error, value } = distributionCenterSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const center = new DistributionCenter(value);
    const docRef = await DistributionCenter.collection.add(center.toFirestore());

    res.status(201).json({
      success: true,
      centerId: docRef.id,
      ...center.toFirestore()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCenter = async (req, res) => {
  try {
    const doc = await DistributionCenter.collection.doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Centro não encontrado' });

    res.status(200).json(DistributionCenter.fromFirestore(doc,doc.id));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCenter = async (req, res) => {
  try {
    const { error, value } = distributionCenterSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const centerRef = DistributionCenter.collection.doc(req.params.id);
    const centerDoc = await centerRef.get();
    if(!centerDoc.exists) return res.status(404).json({ error: 'Centro não encontrado' });

    await centerRef.update({
      ...value,
      updatedAt: new Date().toDateString()
    });

    const updatedDoc = await centerRef.get();
    res.status(200).json(DistributionCenter.fromFirestore(updatedDoc));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteCenter = async (req, res) => {
  try {
    await DistributionCenter.collection.doc(req.params.id).delete();
    res.status(200).json({ success: true, message:'centro excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listCenters = async (req, res) => {
  try {
    const { minCapacity, near } = req.query;
    let query = DistributionCenter.collection;

    if (minCapacity) query = query.where('capacity', '>=', parseInt(minCapacity));
    
    const snapshot = await query.get();
    const centers = snapshot.docs.map(doc =>  DistributionCenter.fromFirestore(doc,doc.id) );

    res.status(200).json({
        centers: centers,
        length: centers.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCenterStats = async (req, res) => {
  try {
    const centerRef = DistributionCenter.collection.doc(req.params.id);
    const [centerDoc, donationsSnap] = await Promise.all([
      centerRef.get(),
      db.collection('donations')
        .where('recipient.centerId', '==', req.params.id)
        .where('status', '==', 'Entregue')
        .get()
    ]);

    if (!centerDoc.exists) return res.status(404).json({ error: 'Centro não encontrado' });

    const stats = {
      totalDeliveries: donationsSnap.size,
      lastDelivery: donationsSnap.docs[0]?.data()?.deliveryDate?.toDate() || null,
      capacityUsage: (centerDoc.data().currentStock / centerDoc.data().capacity) * 100
    };

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCenter,
  getCenter,
  updateCenter,
  deleteCenter,
  listCenters,
  getCenterStats
};