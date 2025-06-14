const admin = require("firebase-admin");
const db = admin.firestore();

// Verifica se usuário é admin
const authenticateAdmin = async (req, res, next) => {
  const { userId } = req.body;
  const userDoc = await db.collection('admin').doc(userId).get();
  if (!userDoc.exists) {
    return res.status(403).json({ error: 'Acesso não autorizado' });
  }
  next();
};

// Valida corpo da requisição
const validateStatusChange = (req, res, next) => {
  const { status } = req.body;
  const validStatuses = [
    'EmProcessamento', 'DisponivelLoja', 
    'Vendido', 'Entregue', 'Descartado', 
    'ImpactoRegistrado'
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: 'Status inválido',
      validStatuses
    });
  }
  next();
};


module.exports = {
    validateStatusChange,
    authenticateAdmin
};