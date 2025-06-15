const admin = require("firebase-admin");
const db = admin.firestore();

// Verifica se usuário é admin
const authenticateAdmin = async (req, res, next) => {
  const { userId } = req.body;
  const userDoc = await db.collection('users').doc(userId).get();
  const role = userDoc.data().role;
  if (userDoc.exists && role == 'user') {
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
    'ImpactoRegistrado',
    "AguardandoColeta",
    "Coletado","DoacaoOuReparo",'Deposito',
    "AvaliacaoManual","Oficina"
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: 'Status inválido',
      validStatuses
    });
  }
  next();
};

const validateUserExiste = async ( req, res, next) => {
  const { userId } = req.body;
   const userDoc = await db.collection('users').doc(userId).get();
   if (!userDoc.exists) {
     return res.status(400).json({ 
      message: 'Usuario não Encontrado',
    });
   }
   next();
}

module.exports = {
    validateStatusChange,
    authenticateAdmin,
};