const admin = require("firebase-admin");
const db = admin.firestore();
const Store = require('../models/storeModel');
const validateStoreSchema  = require('../schemas/storeValidationSchema');

const storeController = {
  async createStore(req, res) {
    try {
      // Validação dos dados
      const { error, value } = validateStoreSchema.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      // Criar nova loja
      const newStore = new Store(value);
      const storeRef = await  Store.collection.add(newStore.toFirestore());

      res.status(201).json({
        success: true,
        id: storeRef.id,
        message: 'Loja registrada com sucesso!',
        store: newStore
      });
    } catch (error) {
        console.log(error.message);
      res.status(500).json({ error: 'Erro ao registrar loja' });
    }
  },

  async getStore(req, res) {
    try {
      const storeId = req.params.id;
      const storeDoc = await db.collection('stores').doc(storeId).get();

      if (!storeDoc.exists) {
        return res.status(404).json({ error: 'Loja não encontrada' });
      }

      res.json({
        id: storeDoc.id,
        data: storeDoc.data()
      });
    } catch (error) {
        console.log(error.message);
      res.status(500).json({ error: 'Erro ao buscar loja' });
    }
  },

  async updateStore(req, res) {
    try {
      const storeId = req.params.id;
      const { error } = validateStoreSchema(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      await db.collection('stores').doc(storeId).update(req.body);

      res.json({ message: 'Loja atualizada com sucesso!' });
    } catch (error) {
        console.log(error.message);
      res.status(500).json({ error: 'Erro ao atualizar loja' });
    }
  },

  async listStores(req, res) {
    try {
      const snapshot = await db.collection('stores').get();
      const stores = [];
      snapshot.forEach(doc => {
        stores.push({
          id: doc.id,
          ...doc.data()
        });
      });

      res.json(stores);
    } catch (error) {
        console.log(error.message);
      res.status(500).json({ error: 'Erro ao listar lojas' });
    }
  }
};

module.exports = storeController;