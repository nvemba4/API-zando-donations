// middleware/authMiddleware.js
const verifyCenterAdmin = async (req, res, next) => {
  const centerId = req.params.id;
  const userId = req.user.uid;

  const centerDoc = await db.collection('distribution_centers').doc(centerId).get();
  if (!centerDoc.exists) return res.status(404).json({ error: 'Centro não encontrado' });

  const adminDoc = await db.collection('admins').doc(userId).get();
  if (!adminDoc.exists || adminDoc.data().role !== 'center_manager') {
    return res.status(403).json({ error: 'Acesso não autorizado' });
  }

  next();
};


module.exports = { verifyCenterAdmin }