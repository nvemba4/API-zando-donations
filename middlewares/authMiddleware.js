// const { admin } = require('../config/firebase-config');
const admin = require('firebase-admin');
const auth = admin.auth();

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticação não fornecido'
    });
  }
  
  const token = authHeader.split('Bearer ')[1];
  
  try {
    
     await auth.verifyIdToken(token)
            .then((decodedToken) => {
              req.user = decodedToken
            } )
    // req.user = decodedToken;
    next();
    
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { authenticate };